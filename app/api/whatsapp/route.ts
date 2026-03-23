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
// ✅ Webhook verification
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
// ✅ GLOBAL LOCKS (WITH TTL)
// =========================
const activeJobs = new Map<string, number>();
const processedMessages = new Set<string>();

function isLocked(asin: string) {
  const now = Date.now();
  const lockTime = activeJobs.get(asin);

  if (lockTime && now - lockTime < 60000) return true;

  activeJobs.set(asin, now);
  return false;
}

function releaseLock(asin: string) {
  activeJobs.delete(asin);
}

// =========================
// ✅ POST
// =========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("OK");

    const messageId = message.id;

    // ✅ 1. Deduplicate webhook
    if (processedMessages.has(messageId)) {
      return new Response("OK");
    }
    processedMessages.add(messageId);

    const from = message.from;
    const text =
      message.text?.body || message.image?.caption || message.video?.caption;

    if (!text) {
      await sendMessage(from, "❌ Send a product link");
      return new Response("OK");
    }

    // ✅ 2. Extract URL
    let url = extractUrl(text);
    if (!url) {
      await sendMessage(from, "❌ No link found");
      return new Response("OK");
    }

    url = await expandShortLink(url);

    // ❌ STRICT RULE: reject gp/product links
    if (url.includes("/gp/product/")) {
      await sendMessage(
        from,
        "❌ Unsupported Amazon link.\n\n👉 Please send a standard /dp/ link or create manually.",
      );
      return new Response("OK");
    }

    // ✅ 3. Extract ASIN
    const asin = extractASIN(url);
    if (!asin) {
      await sendMessage(from, "❌ Invalid Amazon product");
      return new Response("OK");
    }

    // ✅ 4. Normalize URL (VERY IMPORTANT)
    const normalizedUrl = `https://www.amazon.com/dp/${asin}`;

    const slug = `product-${asin}`;
    const affiliateLink = buildAffiliateLink(asin);

    // ✅ 5. Check CMS FIRST
    const existing = await checkProductExistsBySlug(slug);

    if (existing) {
      const existingSlug = existing.fields as { slug?: { "en-US": string } };
      const existingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${existingSlug}?source=all`;

      await sendMessage(from, `✅ Product already exists:\n\n${existingUrl}`);
      return new Response("OK");
    }

    // ✅ 6. Lock system
    if (isLocked(asin)) {
      await sendMessage(from, "⚠️ Already processing, please wait...");
      return new Response("OK");
    }

    // ✅ 7. Background processing
    processProduct({
      url: normalizedUrl,
      affiliateLink,
      from,
      asin,
    })
      .catch(console.error)
      .finally(() => releaseLock(asin));

    await sendMessage(from, "⏳ Processing your product...");

    return new Response("OK");
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
}
