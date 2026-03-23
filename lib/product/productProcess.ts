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

// =========================
// ✅ TIMEOUT WRAPPER
// =========================
async function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );

  return Promise.race([promise, timeout]);
}

// =========================
// ✅ RETRY HELPER
// =========================
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;

    logger.warn("Retrying...", { retriesLeft: retries });

    await new Promise((r) => setTimeout(r, delay));

    return retry(fn, retries - 1, delay * 2);
  }
}

// =========================
// ✅ PROCESS PRODUCT
// =========================
export async function processProduct(data: ProcessProductData) {
  const { url, affiliateLink, from, slug } = data;

  try {
    logger.info("🚀 Processing started", { url });

    // =========================
    // ✅ SCRAPE PRODUCT
    // =========================
    const scraped = await retry(() => withTimeout(scrapeProduct(url), 15000));

    if (!scraped.title || scraped.title === "Amazon.com") {
      await sendMessage(from, "❌ Could not fetch product. Add manually.");
      return;
    }

    // =========================
    // ✅ GENERATE AI CONTENT
    // =========================
    const aiData = await retry(() =>
      withTimeout(generateProductContent(scraped.title), 20000),
    );

    aiData.slug = slug;
    aiData.amazonUrl = affiliateLink;

    aiData.pros = aiData.pros.length
      ? aiData.pros.slice(0, 3)
      : scraped.pros.slice(0, 3);

    aiData.cons = aiData.cons.length
      ? aiData.cons.slice(0, 3)
      : scraped.cons.slice(0, 3);

    // =========================
    // ✅ CHECK DUPLICATE
    // =========================
    const existing = await checkProductExistsBySlug(slug);

    if (existing) {
      // ✅ TYPE-SAFE access (your concern handled properly)
      const existingSlug = (existing.fields as any)?.slug?.["en-US"];

      if (existingSlug) {
        const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;

        await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
      } else {
        await sendMessage(from, "⚠️ Product exists but slug missing.");
      }

      return;
    }

    // =========================
    // ✅ VALIDATE DATA
    // =========================
    if (!aiData.title || !aiData.description || !aiData.category) {
      await sendMessage(
        from,
        "❌ Product data incomplete. Cannot create entry.",
      );
      return;
    }

    // =========================
    // ✅ CREATE ENTRY
    // =========================
    const entry = await retry(() =>
      withTimeout(createProductEntry(aiData), 20000),
    );

    const finalSlug = (entry.fields as any)?.slug?.["en-US"];

    if (!finalSlug) {
      await sendMessage(from, "⚠️ Product created but slug missing.");
      return;
    }

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    // =========================
    // ✅ SEND SUCCESS MESSAGE
    // =========================
    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

    logger.info("✅ Product created", { slug: finalSlug });
  } catch (err) {
    logger.error("❌ processProduct failed", err);

    await sendMessage(from, "❌ Failed. Try again later.");

    throw err;
  }
}
