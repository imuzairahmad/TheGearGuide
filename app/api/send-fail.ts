// /api/send-fail
import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/integrations";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.WORKER_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { from } = await req.json();

  if (from) {
    await sendMessage(from, "❌ Failed to create product. Please try again.");
  }

  return NextResponse.json({ success: true });
}
