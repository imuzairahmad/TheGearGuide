import { rateLimit } from "@/lib/utils/index";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const { success } = await rateLimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return NextResponse.json({ message: "Allowed" });
}
