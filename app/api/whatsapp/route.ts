import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/config/logger";
import { handleIncomingMessage } from "@/lib/automation";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode || !token) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  // ✅ Verify token
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.log("❌ Verification failed");
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Clone the request so we can safely read the body asynchronously
    const cloned = req.clone();
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      logger.warn("⚠️ Incoming request is not JSON");
      return new Response("OK");
    }

    const bodyText = await cloned.text();

    // Meta often sends empty pings
    if (!bodyText || bodyText.trim() === "") {
      logger.info("⚠️ Webhook ping / empty body (normal for Meta)", {
        bodyText,
      });
      return new Response("OK");
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      logger.warn("⚠️ Failed to parse JSON, ignoring", { bodyText });
      return new Response("OK");
    }

    // Process each message asynchronously via worker
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        for (const message of messages) {
          const messageId = message.id;
          const from = message.from;
          const text =
            message.text?.body ||
            message.image?.caption ||
            message.video?.caption;

          if (!text) {
            logger.info("⚠️ Message has no text or caption, skipping", {
              messageId,
            });
            continue;
          }

          logger.info("📩 Incoming message", { messageId, from });

          // ⚡ Trigger your worker asynchronously, safely
          setTimeout(() => handleIncomingMessage(message), 0);
        }
      }
    }

    return new Response("OK");
  } catch (err) {
    logger.error("❌ POST /api/whatsapp failed", err);
    return new Response("OK");
  }
}
