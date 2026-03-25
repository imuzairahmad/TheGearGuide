import {
  sendMessage,
  scrapeProduct,
  generateProductContent,
} from "@/lib/integrations";
import {
  checkProductExistsBySlug,
  isMessageProcessed,
  markMessageProcessed,
  createProductEntry,
  getProductLock,
  canRetryLock,
  fetchLockLatestVersion,
  updateLockStatus,
  createProcessingLock,
} from "../contentful";
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

    // Check if the message has already been processed
    if (await isMessageProcessed(messageId)) {
      logger.warn("⚠️ Duplicate skipped", { messageId });
      return;
    }
    await markMessageProcessed(messageId);

    if (!text) {
      await sendMessage(from, "❌ Send a product link.");
      return;
    }

    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No link found.");
      return;
    }

    url = await expandShortLink(url);
    if (url.includes("/gp/product/")) {
      await sendMessage(from, "❌ Use /dp/ format link.");
      return;
    }

    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product.");
      return;
    }

    // Scrape the product title from the URL
    const normalizedUrl = `https://www.amazon.com/dp/${asin}`;
    let scraped;
    try {
      scraped = await scrapeProduct(normalizedUrl);
    } catch (err) {
      await sendMessage(from, "❌ Failed to fetch product (Amazon blocked).");
      return;
    }

    // Generate a user-friendly slug for the product (shortened)
    const slug = generateSlug(scraped.title); // This generates a clean, short slug
    const affiliateLink = buildAffiliateLink(asin);

    // Check if the product already exists
    const existing = await checkProductExistsBySlug(slug);
    if (existing) {
      await sendMessage(
        from,
        `✅ Already exists:\n${BASE_URL}/products/${slug}`,
      );
      return;
    }

    // Handle product lock to prevent race conditions
    let lock = await getProductLock(slug);
    if (lock) {
      const status = lock.fields.status["en-US"];
      if (status === "processing") {
        await sendMessage(from, "⏳ Already processing.");
        return;
      }
      if (status === "failed" && !canRetryLock(lock)) {
        await sendMessage(from, "⚠️ Try again later.");
        return;
      }
      if (status === "failed") {
        lock = await fetchLockLatestVersion(lock.sys.id);
        await updateLockStatus(lock, "processing");
      }
    } else {
      lock = await createProcessingLock(slug);
    }

    await sendMessage(from, "⏳ Processing your product...");

    // Generate AI content for the product
    let aiData;
    try {
      aiData = await generateProductContent(scraped.title);
      aiData.slug = slug; // Ensure this uses the generated slug
      aiData.amazonUrl = affiliateLink;
    } catch (err) {
      await sendMessage(from, "❌ AI generation failed.");
      return;
    }

    // Create product entry in Contentful
    let entry;
    try {
      entry = await createProductEntry(aiData);
    } catch (err) {
      await sendMessage(from, "❌ Failed to save product.");
      return;
    }

    // Mark the product as completed in Contentful
    lock = await fetchLockLatestVersion(lock.sys.id);
    await updateLockStatus(lock, "completed");

    await sendMessage(from, `🔥 Product ready:\n${BASE_URL}/products/${slug}`);
  } catch (err) {
    logger.error("❌ Worker failed", err);
    await sendMessage(from, "❌ Failed. Try again later.");
  }
}
