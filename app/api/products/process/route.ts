import { NextResponse } from "next/server";

import { logger } from "@/config/logger";
import { scrapeProduct, generateProductContent } from "@/lib/integrations";
import { createProductEntry } from "@/lib/contentful";
import { sendMessage } from "@/lib/integrations";

export async function POST(req: Request) {
  let from: string | undefined;

  try {
    // 🔐 SECURITY
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.WORKER_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 📥 INPUT
    const body = await req.json();

    const {
      url,
      affiliateLink,
      from: userPhone,
    }: {
      url: string;
      affiliateLink: string;
      from: string;
    } = body;

    from = userPhone;

    if (!url || !affiliateLink || !from) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    logger.info("🚀 API processing started", { url });

    // 🛒 1. SCRAPE PRODUCT
    const scraped = await scrapeProduct(url);

    // 🤖 2. AI GENERATION
    const aiData = await generateProductContent(scraped.title);

    // 🧠 3. FALLBACK LOGIC (same as your worker)
    aiData.pros = (
      aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
    ).slice(0, 3);

    aiData.cons = (
      aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
    ).slice(0, 3);

    // 🔗 4. ADD AFFILIATE LINK
    aiData.amazonUrl = affiliateLink;

    // 🧾 5. SAVE TO CONTENTFUL
    const entry = await createProductEntry(aiData);

    const fields = entry.fields as { slug?: { "en-US": string } };
    const finalSlug = fields.slug?.["en-US"];

    if (!finalSlug) {
      throw new Error("Slug missing");
    }

    const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

    // 📲 6. SEND WHATSAPP
    await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

    logger.info("✅ Product created successfully", {
      slug: finalSlug,
    });

    // ✅ RESPONSE
    return NextResponse.json({
      success: true,
      slug: finalSlug,
      url: finalUrl,
    });
  } catch (err) {
    logger.error("❌ API failed", {
      error: err instanceof Error ? err.message : err,
    });

    // ❗ send fail message
    if (from) {
      await sendMessage(from, "❌ Failed to create product. Please try again.");
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
