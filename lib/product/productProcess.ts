// lib/product/processProduct.ts
import slugify from "slugify";
import { logger } from "@/config/logger";
import {
  generateProductContent,
  scrapeProduct,
  sendMessage,
} from "@/lib/integrations";
import { createProductEntry } from "@/lib/contentful";

// Optional: retry helper for resilient requests
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export async function processProduct(data: {
  url: string;
  affiliateLink: string;
  from: string;
  checkOnly?: boolean;
}) {
  const { url, affiliateLink, from, checkOnly = false } = data;

  try {
    logger.info("🚀 Processing started", { url });

    const scraped = await retry(() => scrapeProduct(url));

    if (
      !scraped.title ||
      scraped.title === "Amazon.com" ||
      /page not found|robot check|captcha/i.test(scraped.title)
    ) {
      if (!checkOnly) {
        await sendMessage(
          from,
          "❌ Could not fetch product details. Please create it manually.",
        );
      }
      logger.warn("⚠️ Invalid product detected", { title: scraped.title });
      return false;
    }

    if (checkOnly) return true;

    const aiData = await retry(() => generateProductContent(scraped.title));

    aiData.pros = (
      aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
    ).slice(0, 3);
    aiData.cons = (
      aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
    ).slice(0, 3);

    const shortTitle = scraped.title.split(" ").slice(0, 6).join(" ");
    const cleanSlug = slugify(shortTitle, {
      lower: true,
      strict: true,
      trim: true,
    }).replace(/-$/, "");

    if (!cleanSlug || cleanSlug.length < 5)
      throw new Error("Slug generation failed");

    aiData.slug = cleanSlug;
    aiData.amazonUrl = affiliateLink;

    const entry = await retry(() => createProductEntry(aiData));
    const finalSlug = entry?.fields?.slug?.["en-US"] || cleanSlug;
    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);
    logger.info("✅ Product created", { slug: finalSlug });

    return { success: true, slug: finalSlug, url: finalUrl };
  } catch (err) {
    logger.error("❌ Processing failed", {
      error: err instanceof Error ? err.message : err,
    });
    await sendMessage(from, "❌ Failed to create product. Please try again.");
    throw err;
  }
}
