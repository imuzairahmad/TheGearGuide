import { NextRequest } from "next/server";
import { sendMessage } from "@/lib/integrations";
import { checkProductExistsBySlug, createProductEntry } from "@/lib/contentful";
import {
  buildAffiliateLink,
  expandShortLink,
  extractASIN,
  extractUrl,
} from "@/lib/utils/index";

import { logger } from "@/config/logger";
import { processProduct } from "@/lib/product";

// =========================
// ✅ GLOBAL LOCKS / DEDUP
// =========================
const activeJobs = new Map<string, number>();
const processedMessages = new Set<string>();

function isLocked(asin: string) {
  const now = Date.now();
  const lockTime = activeJobs.get(asin);
  if (lockTime && now - lockTime < 60000) return true; // 1 min lock
  activeJobs.set(asin, now);
  return false;
}
function releaseLock(asin: string) {
  activeJobs.delete(asin);
}

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
    if (processedMessages.has(messageId)) return new Response("OK");
    processedMessages.add(messageId);

    const from = message.from;
    const text =
      message.text?.body || message.image?.caption || message.video?.caption;

    if (!text) {
      await sendMessage(from, "❌ Send a product link.");
      return new Response("OK");
    }

    // ✅ Extract and expand URL
    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No link found.");
      return new Response("OK");
    }
    url = await expandShortLink(url);

    // ❌ Reject gp/product links (manual only)
    if (url.includes("/gp/product/")) {
      await sendMessage(
        from,
        "❌ Unsupported Amazon link.\nPlease send a standard /dp/ link or create manually.",
      );
      return new Response("OK");
    }

    // ✅ Extract ASIN
    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product.");
      return new Response("OK");
    }

    const normalizedUrl = `https://www.amazon.com/dp/${asin}`;
    const slug = `product-${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // ✅ Check CMS first
    const existing = await checkProductExistsBySlug(slug);
    if (existing) {
      const existingSlug = existing.fields as { slug?: { "en-US": string } };
      const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;
      await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
      return new Response("OK");
    }

    // ✅ Lock system
    if (isLocked(asin)) {
      await sendMessage(from, "⚠️ Already processing, please wait...");
      return new Response("OK");
    }

    // ✅ Send processing message
    await sendMessage(from, "⏳ Processing your product...");

    // ✅ Background processing
    processProduct({
      url: normalizedUrl,
      affiliateLink,
      from,
      asin,
      slug,
    })
      .catch(async (err) => {
        logger.error("Background processProduct failed", err);
        await sendMessage(from, "❌ Failed to process product. Try again.");
      })
      .finally(() => releaseLock(asin));

    return new Response("OK");
  } catch (err) {
    logger.error("POST /api/whatsapp failed", err);
    return new Response("❌ Error processing request.", { status: 500 });
  }
}
