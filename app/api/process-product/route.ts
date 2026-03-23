import { NextRequest } from "next/server";
import { processProduct } from "@/lib/product";
import { logger } from "@/config/logger";

// Optional: increase timeout (important for Vercel)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    logger.info("🚀 processProduct triggered", data);

    await processProduct(data);

    return new Response("OK");
  } catch (err) {
    logger.error("❌ processProduct failed", err);
    return new Response("Error", { status: 500 });
  }
}
