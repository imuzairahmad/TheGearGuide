import { logger } from "@/config/logger";
import {
  generateProductContent,
  scrapeProduct,
  sendMessage,
} from "../integrations";
import { checkProductExistsBySlug, createProductEntry } from "../contentful";

interface ProcessProductData {
  url: string;
  affiliateLink: string;
  from: string;
  asin: string;
  slug: string;
}

async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export async function processProduct(data: ProcessProductData) {
  const { url, affiliateLink, from, asin, slug } = data;

  try {
    logger.info("🚀 Processing started", { url });

    // ✅ Scrape product
    const scraped = await retry(() => scrapeProduct(url));

    // ❌ Validate scraped data
    if (!scraped.title || scraped.title === "Amazon.com") {
      await sendMessage(from, "❌ Could not fetch product. Add manually.");
      return;
    }

    // ✅ AI content generation
    const aiData = await retry(() => generateProductContent(scraped.title));
    aiData.slug = slug;
    aiData.amazonUrl = affiliateLink;
    aiData.pros = aiData.pros.length
      ? aiData.pros.slice(0, 3)
      : scraped.pros.slice(0, 3);
    aiData.cons = aiData.cons.length
      ? aiData.cons.slice(0, 3)
      : scraped.cons.slice(0, 3);

    // ❌ Final duplicate check
    const existing = await checkProductExistsBySlug(slug);
    if (existing) {
      const existingSlug = existing.fields as { slug?: { "en-US": string } };
      const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;
      await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
      return;
    }

    // ✅ Validate AI + scraped data
    if (!aiData.title || !aiData.description || !aiData.category) {
      await sendMessage(
        from,
        "❌ Product data incomplete. Cannot create entry.",
      );
      return;
    }

    // ✅ Create Contentful entry
    const entry = await retry(() => createProductEntry(aiData));
    const finalSlug = entry.fields.slug["en-US"];
    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);
    logger.info("✅ Product created", { slug: finalSlug });
  } catch (err) {
    logger.error("❌ processProduct failed", err);
    await sendMessage(from, "❌ Failed. Try again later.");
    throw err;
  }
}
