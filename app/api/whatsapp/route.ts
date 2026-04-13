import { logger } from "@/config/logger";
import { handleIncomingMessage } from "@/lib/automation";
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // ✅ Check both formats (dot and underscore)
  const mode = sp.get("hub.mode") || sp.get("hub_mode");
  const token = sp.get("hub.verify_token") || sp.get("hub_verify_token");
  const challenge = sp.get("hub.challenge") || sp.get("hub_challenge");

  logger.info("🔍 Webhook verification attempt", {
    mode,
    token: token?.substring(0, 10),
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    logger.info("✅ Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  logger.error("❌ Verification failed", { mode, token });
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    logger.info("📩 Incoming webhook", {
      object: body.object,
      entries: body.entry?.length,
    });

    const messages: any[] = [];

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        messages.push(...(change.value?.messages || []));
      }
    }

    // Process with proper error boundaries
    const results = await Promise.allSettled(
      messages.map((msg) => handleIncomingMessage(msg)),
    );

    // Log failures
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        logger.error(`❌ Message ${i} failed`, result.reason);
      }
    });

    return NextResponse.json({
      status: "ok",
      processed: messages.length,
      failed: results.filter((r) => r.status === "rejected").length,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("❌ Webhook error", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
