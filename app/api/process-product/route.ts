import { NextRequest } from "next/server";
import { handleIncomingMessage } from "@/lib/automation";
import { logger } from "@/config/logger";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    logger.info("🚀 Processing job", data);

    await handleIncomingMessage(data);

    return new Response("OK");
  } catch (err) {
    logger.error("❌ process-product failed", err);
    return new Response("Error", { status: 500 });
  }
}
