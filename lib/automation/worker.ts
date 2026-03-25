import {
  sendMessage,
  scrapeProduct,
  generateProductContent,
} from "@/lib/integrations";

import {
  markMessageProcessedAtomic,
  acquireProductLock,
  updateLockStatus,
  fetchLockLatestVersion,
  canRetryLock,
  createProductEntry,
  getLockProductSlug, // 🔧 New import
} from "@/lib/contentful";

import {
  extractUrl,
  extractASIN,
  expandShortLink,
  buildAffiliateLink,
  generateSlug,
} from "@/lib/utils/index";

import { logger } from "@/config/logger";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function handleIncomingMessage(message: any) {
  const messageId = message.id;
  const from = message.from;
  const text =
    message.text?.body || message.image?.caption || message.video?.caption;

  try {
    logger.info("📩 Incoming message", { messageId, from });

    // ✅ ATOMIC MESSAGE DEDUP
    const isNew = await markMessageProcessedAtomic(messageId);
    if (!isNew) {
      logger.warn("⚠️ Duplicate message skipped", { messageId });
      return;
    }

    if (!text) {
      await sendMessage(from, "❌ Please send a product link.");
      return;
    }

    // ✅ EXTRACT URL & ASIN
    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No valid link found.");
      return;
    }

    url = await expandShortLink(url);

    if (url.includes("/gp/product/")) {
      await sendMessage(from, "❌ Please use /dp/ format link.");
      return;
    }

    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product link.");
      return;
    }

    const productUrl = `https://www.amazon.com/dp/${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // 🔥 LOCK SYSTEM (by ASIN, not slug)
    let lockResult = await acquireProductLock(asin);
    let lock = lockResult.lock;

    if (lockResult.state === "processing") {
      await sendMessage(from, "⏳ Already processing this product.");
      return;
    }

    if (lockResult.state === "completed") {
      // 🔧 Get slug from lock, not ASIN
      const productSlug = getLockProductSlug(lock) || asin;
      await sendMessage(
        from,
        `✅ Product already exists:\n${BASE_URL}/products/${productSlug}`,
      );
      return;
    }

    if (lockResult.state === "failed") {
      if (!canRetryLock(lock)) {
        await sendMessage(
          from,
          "⚠️ Processing failed recently. Please try again in 5 minutes.",
        );
        return;
      }
      // Retry: update lock to processing
      const latest = await fetchLockLatestVersion(lock.sys.id);
      await updateLockStatus(latest, "processing");
      lock = latest;
    }

    await sendMessage(from, "⏳ Processing your product...");

    // 🔍 SCRAPE PRODUCT
    let scraped;
    try {
      scraped = await scrapeProduct(productUrl);
    } catch (err) {
      logger.error("❌ Scraping failed", { asin, err });
      await updateLockStatus(lock, "failed");
      await sendMessage(
        from,
        "❌ Failed to fetch product details. Please check the link and try again.",
      );
      return;
    }

    // 🏷 GENERATE SLUG FROM TITLE
    const slug = generateSlug(scraped.title);

    // 🤖 AI CONTENT GENERATION
    let aiData;
    try {
      aiData = await generateProductContent(scraped.title);
      aiData.slug = slug;
      aiData.amazonUrl = affiliateLink;
    } catch (err) {
      logger.error("❌ AI generation failed", { asin, err });
      await updateLockStatus(lock, "failed");
      await sendMessage(
        from,
        "❌ Failed to generate product content. Please try again.",
      );
      return;
    }

    // 💾 SAVE TO CONTENTFUL
    let finalSlug = slug;
    try {
      const existingProduct = await createProductEntry(aiData);
      // If returned existing, use its slug
      if (existingProduct?.fields?.slug?.["en-US"]) {
        finalSlug = existingProduct.fields.slug["en-US"];
      }
    } catch (err: any) {
      const slugError =
        err?.details?.errors?.[0]?.name === "unique" &&
        err?.details?.errors?.[0]?.path?.includes("slug");

      if (slugError) {
        // Product exists with this slug
        finalSlug = slug;
        await sendMessage(
          from,
          `✅ Product already exists:\n${BASE_URL}/products/${finalSlug}`,
        );
        // Mark lock complete with existing slug
        const latest = await fetchLockLatestVersion(lock.sys.id);
        await updateLockStatus(latest, "completed", finalSlug);
        return;
      }

      logger.error("❌ Failed to save product", { asin, err });
      await updateLockStatus(lock, "failed");
      await sendMessage(
        from,
        "❌ Failed to save product. Please try again later.",
      );
      return;
    }

    // ✅ COMPLETE LOCK WITH FINAL SLUG
    const latest = await fetchLockLatestVersion(lock.sys.id);
    await updateLockStatus(latest, "completed", finalSlug);

    await sendMessage(
      from,
      `🔥 Product ready:\n${BASE_URL}/products/${finalSlug}`,
    );

    logger.info("✅ Product processed successfully", { asin, slug: finalSlug });
  } catch (err) {
    logger.error("❌ Worker failed", { messageId, err });
    await sendMessage(
      from,
      "❌ An unexpected error occurred. Please try again later.",
    );
  }
}
