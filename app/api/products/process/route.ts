// /api/products/process
import { NextResponse } from "next/server";
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

    // ✅ USE SCRAPED DATA (NO PUPPETEER HERE)
    const aiData = await generateProductContent(scraped.title);

    aiData.pros = (
      aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
    ).slice(0, 3);

    aiData.cons = (
      aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
    ).slice(0, 3);

    aiData.amazonUrl = affiliateLink;

    const entry = await createProductEntry(aiData);

    const fields = entry.fields as { slug?: { "en-US": string } };
    const finalSlug = fields.slug?.["en-US"];

    if (!finalSlug) throw new Error("Slug missing");

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    // ✅ SUCCESS MESSAGE
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
