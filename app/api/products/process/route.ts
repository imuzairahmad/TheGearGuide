import { NextResponse } from "next/server";
import slugify from "slugify";
import { logger } from "@/config/logger";
import { generateProductContent } from "@/lib/integrations";
import { createProductEntry } from "@/lib/contentful";
import { sendMessage } from "@/lib/integrations";

export async function POST(req: Request) {
  let from: string | undefined;

  try {
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

    // ✅ Better fallback logic
    aiData.pros = (
      aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
    ).slice(0, 3);

    aiData.cons = (
      aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
    ).slice(0, 3);

    // ✅ Clean slug (IMPORTANT FIX)
    const cleanSlug = slugify(scraped.title, {
      lower: true,
      strict: true,
    }).slice(0, 80);

    aiData.slug = cleanSlug;

    // ✅ Affiliate
    aiData.amazonUrl = affiliateLink;

    const entry = await createProductEntry(aiData);

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${cleanSlug}?source=all`;

    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      url: finalUrl,
    });
  } catch (err) {
    logger.error("❌ API failed", {
      error: err instanceof Error ? err.message : err,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
