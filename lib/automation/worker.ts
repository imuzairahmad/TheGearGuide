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
  getLockProductSlug,
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

// 🔥 IN-MEMORY DEDUPLICATION CACHE (prevents race conditions)
const processedMessages = new Set<string>();

export async function handleIncomingMessage(message: any) {
  const messageId = message.id;
  const from = message.from;
  const text =
    message.text?.body || message.image?.caption || message.video?.caption;

  try {
    logger.info("📩 Incoming message", { messageId, from });

    // 🔥 STEP 1: INSTANT IN-MEMORY DEDUP (catches rapid duplicates)
    if (processedMessages.has(messageId)) {
      logger.warn("⚠️ Duplicate message blocked by memory cache", {
        messageId,
      });
      return;
    }
    processedMessages.add(messageId);

    // Keep cache size manageable (keep last 1000 messages)
    if (processedMessages.size > 1000) {
      const iterator = processedMessages.values();
      const firstValue = iterator.next().value;
      if (firstValue !== undefined) {
        processedMessages.delete(firstValue);
      }
    }

    // 🔥 STEP 2: DATABASE DEDUP (Contentful - persistent)
    const isNew = await markMessageProcessedAtomic(messageId);
    if (!isNew) {
      logger.warn("⚠️ Duplicate message skipped (database)", { messageId });
      return;
    }

    if (!text) {
      await sendMessage(from, "❌ Please send a product link.");
      return;
    }

    // ✅ EXTRACT URL
    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No valid link found.");
      return;
    }

    // 🔥 EXPAND SHORT LINK (may return same URL if blocked)
    const resolvedUrl = (await expandShortLink(url)).trim();
    logger.info("🔗 Resolved URL", { original: url, resolved: resolvedUrl });

    // ✅ VALIDATE DOMAIN (allow amazon.* and amzn.*)
    if (!resolvedUrl.match(/(amazon\.[a-z.]+|amzn\.to|amzn\.com)/i)) {
      await sendMessage(from, "❌ Invalid Amazon link.");
      return;
    }

    // 🔥 TRY TO EXTRACT ASIN (for short links, this will be null)
    const extractedAsin = extractASIN(resolvedUrl);

    // For short links, we'll get ASIN from scraper later
    const isShortLink =
      resolvedUrl.includes("amzn.to") || resolvedUrl.includes("amzn.com");

    // 🔥 LOCK SYSTEM
    // If we have ASIN now, check lock. If not (short link), skip lock check until after scrape
    let lock: any = null;
    let asinForLock: string | null = extractedAsin;

    if (asinForLock) {
      const lockResult = await acquireProductLock(asinForLock);
      lock = lockResult.lock;

      if (lockResult.state === "processing") {
        await sendMessage(from, "⏳ Already processing this product.");
        return;
      }

      if (lockResult.state === "completed") {
        const productSlug = getLockProductSlug(lock) || asinForLock;
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
            "⚠️ Processing failed recently. Please try again in 5 minutes.`",
          );
          return;
        }
        const latest = await fetchLockLatestVersion(lock.sys.id);
        await updateLockStatus(latest, "processing");
        lock = latest;
      }
    }

    await sendMessage(from, "⏳ Processing your product...");

    // 🔍 SCRAPE PRODUCT
    let scraped: any;
    try {
      scraped = await scrapeProduct(resolvedUrl);
    } catch (err) {
      logger.error("❌ Scraping failed", { url: resolvedUrl, err });

      // Update lock if we had one
      if (lock) {
        await updateLockStatus(lock, "failed");
      }

      await sendMessage(
        from,
        "❌ Failed to fetch product details. The product may be unavailable or restricted.",
      );
      return;
    }

    // 🔥 GET ASIN FROM SCRAPER (for short links)
    if (!asinForLock && scraped.asin) {
      asinForLock = scraped.asin;
      console.log(`✅ Got ASIN from scraper: ${asinForLock}`);

      // Now check lock with the ASIN we just got
      const lockResult = await acquireProductLock(asinForLock!);
      lock = lockResult.lock;

      if (lockResult.state === "processing") {
        await sendMessage(from, "⏳ Already processing this product.");
        return;
      }

      if (lockResult.state === "completed") {
        const productSlug = getLockProductSlug(lock) || asinForLock;
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
        const latest = await fetchLockLatestVersion(lock.sys.id);
        await updateLockStatus(latest, "processing");
        lock = latest;
      }
    }

    // If still no ASIN, we can't proceed
    if (!asinForLock) {
      logger.error("❌ Could not extract ASIN from URL or scraper");
      await sendMessage(from, "❌ Could not extract product ID from link.");
      return;
    }

    // 🔥 EXPLICIT TYPE ASSERTION - asinForLock is now guaranteed to be string
    const asin: string = asinForLock;

    // 🏷 GENERATE SLUG FROM TITLE
    const slug = generateSlug(scraped.title);

    // Build affiliate link - asin is now guaranteed to be string
    const affiliateLink = buildAffiliateLink(
      asin,
      scraped.finalUrl || resolvedUrl,
    );

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
      if (existingProduct?.fields?.slug?.["en-US"]) {
        finalSlug = existingProduct.fields.slug["en-US"];
      }
    } catch (err: any) {
      const slugError =
        err?.details?.errors?.[0]?.name === "unique" &&
        err?.details?.errors?.[0]?.path?.includes("slug");

      if (slugError) {
        finalSlug = slug;
        await sendMessage(
          from,
          `✅ Product already exists:\n${BASE_URL}/products/${finalSlug}`,
        );
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
