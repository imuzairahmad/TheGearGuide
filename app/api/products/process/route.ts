import { NextResponse } from "next/server";
import slugify from "slugify";
import { logger } from "@/config/logger";
import { generateProductContent } from "@/lib/integrations";
import { createProductEntry } from "@/lib/contentful";
import { sendMessage } from "@/lib/integrations";

export async function POST(req: Request) {
  let from: string | undefined;

  try {
    // 🔐 Auth check
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.WORKER_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { url, affiliateLink, from: userPhone, scraped } = body;

    from = userPhone;

    if (!url || !affiliateLink || !from || !scraped) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    logger.info("🚀 API processing started", { url });

    // ❌ Validate scrape
    if (!scraped.title || scraped.title === "Amazon.com") {
      throw new Error("Invalid scraped title");
    }

    // ✅ Generate AI content
    const aiData = await generateProductContent(scraped.title);

    // ✅ Fallback logic
    aiData.pros = (
      aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
    ).slice(0, 3);

    aiData.cons = (
      aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
    ).slice(0, 3);

    // =========================
    // ✅ FIXED SLUG LOGIC
    // =========================

    // 👉 Take only first few words (clean + SEO friendly)
    const shortTitle = scraped.title.split(" ").slice(0, 6).join(" ");

    const cleanSlug = slugify(shortTitle, {
      lower: true,
      strict: true,
      trim: true,
    }).replace(/-$/, ""); // remove trailing dash if exists

    if (!cleanSlug || cleanSlug.length < 5) {
      throw new Error("Slug generation failed");
    }

    aiData.slug = cleanSlug;

    // =========================

    // ✅ Affiliate link
    aiData.amazonUrl = affiliateLink;

    // ✅ Create entry in Contentful
    const entry = await createProductEntry(aiData);

    // =========================
    // ✅ USE CONTENTFUL SLUG (SOURCE OF TRUTH)
    // =========================
    const finalSlug = entry?.fields?.slug?.["en-US"] || cleanSlug;

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    // =========================

    // ✅ Send WhatsApp message
    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      url: finalUrl,
    });
  } catch (err) {
    logger.error("❌ API failed", {
      error: err instanceof Error ? err.message : err,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
