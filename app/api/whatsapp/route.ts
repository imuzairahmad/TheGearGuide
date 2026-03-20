// app/api/whatsapp/route.ts
import { NextRequest } from "next/server";
import {
  extractUrl,
  expandShortLink,
  extractASIN,
  buildAffiliateLink,
} from "@/lib/utils/index";

import { addProductToQueue } from "@/lib/automation/queues/product.queue";
import { sendMessage } from "@/lib/integrations";
import { checkProductExistsBySlug } from "@/lib/contentful";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("OK");

    const from = message.from;
    const text =
      message.text?.body || message.image?.caption || message.video?.caption;

    if (!text) {
      await sendMessage(from, "❌ Send a product link");
      return new Response("OK");
    }

    // 1️⃣ Extract URL
    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No link found");
      return new Response("OK");
    }

    // 2️⃣ Expand short links
    url = await expandShortLink(url);

    // 3️⃣ Only allow /dp/ links
    if (!url.includes("/dp/")) {
      await sendMessage(
        from,
        "❌ This link format cannot be scraped. Please add this product manually.",
      );
      return new Response("OK");
    }

    // 4️⃣ Extract ASIN
    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product");
      return new Response("OK");
    }

    // 5️⃣ Slug + affiliate
    const slug = `product-${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // 6️⃣ Duplicate check
    const existing = await checkProductExistsBySlug(slug);
    if (existing) {
      const fields = existing.fields as { slug?: { "en-US": string } };
      const existingSlug = fields.slug?.["en-US"];
      if (existingSlug) {
        const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;
        await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
        return new Response("OK");
      }
      await sendMessage(from, "⚠️ Product exists but slug missing");
      return new Response("OK");
    }

    // 7️⃣ Add to queue
    const queueResult = await addProductToQueue({
      url,
      asin,
      slug,
      affiliateLink,
      from,
    });

    if (queueResult.status === "duplicate") {
      await sendMessage(
        from,
        "⚠️ Product is already being processed. Make a new request.",
      );
      return new Response("OK");
    }

    await sendMessage(from, "⏳ Processing your product... please wait");
    return new Response("OK");
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
}
