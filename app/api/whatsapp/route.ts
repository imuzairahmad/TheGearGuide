// api/whatsapp/route.ts
import { NextRequest } from "next/server";
import { sendMessage } from "@/lib/integrations";
import { checkProductExistsBySlug } from "@/lib/contentful";
import {
  buildAffiliateLink,
  expandShortLink,
  extractASIN,
  extractUrl,
} from "@/lib/utils/index";
import { processProduct } from "@/lib/product";

// =========================
// ✅ GET: WhatsApp webhook verification
// =========================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// =========================
// 🧠 Simple in-memory lock to prevent duplicate processing
// =========================
const activeJobs = new Set<string>();

// =========================
// ✅ POST: Incoming WhatsApp messages
// =========================
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

    // 4 Extract ASIN
    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product");
      return new Response("OK");
    }

    if (!asin || !url.includes("/dp/")) {
      await sendMessage(
        from,
        "❌ Unsupported Amazon link.\n\n👉 Please send a standard product link (dp format) or add manually.",
      );
      return new Response("OK");
    }

    // 5️⃣ Slug + Affiliate
    const slug = `product-${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // 6️⃣ Duplicate check in CMS
    const existing = await checkProductExistsBySlug(slug);

    if (existing) {
      const fields = existing.fields as { slug?: { "en-US": string } };
      const existingSlug = fields.slug?.["en-US"];

      if (existingSlug) {
        const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;

        await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);

        return new Response("OK");
      }
    }

    // 7️⃣ In-memory duplicate protection
    if (activeJobs.has(asin)) {
      await sendMessage(
        from,
        "⚠️ This product is already being processed. Please wait.",
      );
      return new Response("OK");
    }
    activeJobs.add(asin);

    // 8️⃣ Background processing (do not await)
    processProduct({ url, affiliateLink, from })
      .catch((err) => console.error("processProduct failed:", err))
      .finally(() => activeJobs.delete(asin));

    // 9️⃣ Instant reply
    await sendMessage(from, "⏳ Processing your product... please wait");

    return new Response("OK");
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
}
