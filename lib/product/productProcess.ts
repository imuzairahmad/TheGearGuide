import { logger } from "@/config/logger";
import {
  generateProductContent,
  scrapeProduct,
  sendMessage,
} from "@/lib/integrations";
import { createProductEntry, checkProductExistsBySlug } from "@/lib/contentful";

async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, 2000));
    return retry(fn, retries - 1);
  }
}

export async function processProduct(data: {
  url: string;
  affiliateLink: string;
  from: string;
  asin: string;
}) {
  const { url, affiliateLink, from, asin } = data;

  const slug = `product-${asin}`;

  try {
    logger.info("🚀 Processing started", { url });

    const scraped = await retry(() => scrapeProduct(url));

    if (!scraped.title || scraped.title === "Amazon.com") {
      await sendMessage(
        from,
        "❌ Could not fetch product. Please create manually.",
      );
      return;
    }

    // ✅ AI content
    const aiData = await retry(() => generateProductContent(scraped.title));

    aiData.slug = slug;
    aiData.amazonUrl = affiliateLink;
    aiData.pros = (aiData.pros.length ? aiData.pros : scraped.pros).slice(0, 3);
    aiData.cons = (aiData.cons.length ? aiData.cons : scraped.cons).slice(0, 3);

    // 🔥 FINAL DUPLICATE CHECK (MOST IMPORTANT)
    const existing = await checkProductExistsBySlug(slug);

    if (existing) {
      const existingSlug = existing.fields as { slug?: { "en-US": string } };
      const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;

      await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
      return;
    }

    // ✅ Create
    const entry = await retry(() => createProductEntry(aiData));

    const finalSlug = entry.fields.slug["en-US"];
    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

    logger.info("✅ Product created", { slug: finalSlug });

    return { success: true };
  } catch (err) {
    logger.error("❌ Failed", err);
    await sendMessage(from, "❌ Failed. Try again.");
    throw err;
  }
}
