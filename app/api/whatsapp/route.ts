import { NextRequest } from "next/server";
import { sendMessage } from "@/lib/integrations";
import {
  checkProductExistsBySlug,
  isMessageProcessed,
  markMessageProcessed,
} from "@/lib/contentful";
import {
  buildAffiliateLink,
  expandShortLink,
  extractASIN,
  extractUrl,
} from "@/lib/utils/index";
import { logger } from "@/config/logger";

// =========================
// ✅ CONFIG
// =========================
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

// =========================
// ✅ WEBHOOK VERIFICATION
// =========================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (
    searchParams.get("hub.mode") === "subscribe" &&
    searchParams.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(searchParams.get("hub.challenge"), { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// =========================
// ✅ POST: WHATSAPP WEBHOOK
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("OK");

    const messageId = message.id;
    const from = message.from;

    logger.info("📩 Incoming message", { messageId, from });

    // =========================
    // ✅ DEDUP USING CONTENTFUL
    // =========================
    const alreadyProcessed = await isMessageProcessed(messageId);

    if (alreadyProcessed) {
      logger.info("⚠️ Duplicate skipped", { messageId });
      return new Response("OK");
    }

    // mark immediately (IMPORTANT)
    await markMessageProcessed(messageId);

    const text =
      message.text?.body || message.image?.caption || message.video?.caption;

    if (!text) {
      await sendMessage(from, "❌ Send a product link.");
      return new Response("OK");
    }

    // =========================
    // ✅ EXTRACT URL
    // =========================
    let url = extractUrl(text);

    if (!url) {
      await sendMessage(from, "❌ No link found.");
      return new Response("OK");
    }

    url = await expandShortLink(url);

    if (url.includes("/gp/product/")) {
      await sendMessage(from, "❌ Unsupported Amazon link.\nSend a /dp/ link.");
      return new Response("OK");
    }

    // =========================
    // ✅ EXTRACT ASIN
    // =========================
    const asin = extractASIN(url);

    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product.");
      return new Response("OK");
    }

    const slug = `product-${asin}`;
    const normalizedUrl = `https://www.amazon.com/dp/${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // =========================
    // ✅ CHECK EXISTING
    // =========================
    const existing = await checkProductExistsBySlug(slug);

    if (existing) {
      const existingSlug = existing.fields as { slug?: { "en-US": string } };
      const existingUrl = `${BASE_URL}/products/${existingSlug}?source=all`;

      await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);

      return new Response("OK");
    }

    // =========================
    // ✅ QUICK RESPONSE FIRST (IMPORTANT)
    // =========================
    await sendMessage(from, "⏳ Processing your product...");

    // =========================
    // ✅ TRIGGER BACKGROUND JOB (SAFE WAY)
    // =========================
    try {
      await fetch(`${BASE_URL}/api/process-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: normalizedUrl,
          affiliateLink,
          from,
          asin,
          slug,
        }),
      });
    } catch (err) {
      logger.error("❌ Failed to trigger background job", err);
      await sendMessage(from, "❌ Failed to start processing.");
    }

    return new Response("OK");
  } catch (err) {
    logger.error("❌ Webhook error", err);
    return new Response("Error", { status: 500 });
  }
}
