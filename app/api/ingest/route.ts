// app/api/products/queue/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashString } from "@/lib/utils/hash";
import { redisConnection } from "@/config/redis";
import { addProductToQueue } from "@/lib/automation";
import { extractASIN } from "@/lib/utils/index";

// Request schema validation
const bodySchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const { url } = bodySchema.parse(await req.json());

    // Extract ASIN from URL
    const asin = extractASIN(url);
    if (!asin)
      return NextResponse.json(
        { error: "Invalid Amazon URL" },
        { status: 400 },
      );

    // Hash ASIN for Redis key
    const hash = hashString(asin);

    // Check if already queued
    const exists = await redisConnection.get(`product:${hash}`);
    if (exists) return NextResponse.json({ message: "Already exists" });

    // Queue product
    let job;
    try {
      job = await addProductToQueue({
        asin,
        url,
        slug: "",
        affiliateLink: "",
        from: "api", //
      });
      await redisConnection.set(
        `product:${hash}`,
        "queued",
        "EX",
        24 * 60 * 60,
      ); // 24h TTL
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to queue product" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Queued successfully",
      jobId: job.status,
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((e) => e.message).join(", ")
        : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
