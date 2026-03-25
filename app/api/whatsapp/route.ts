import { logger } from "@/config/logger";
import { handleIncomingMessage } from "@/lib/automation";
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  if (
    sp.get("hub.mode") === "subscribe" &&
    sp.get("hub.verify_token") === VERIFY_TOKEN
  ) {
    return new NextResponse(sp.get("hub.challenge"), { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages: any[] = [];

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        messages.push(...(change.value?.messages || []));
      }
    }

    // ⚡ Process safely (no background loss)
    await Promise.allSettled(messages.map((msg) => handleIncomingMessage(msg)));

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    logger.error("❌ Webhook error", err);
    return NextResponse.json({ status: "error" });
  }
}
