import { NextResponse } from "next/server";
import { createClient } from "contentful";
import { mapContentfulProduct } from "@/lib/contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const type = url.searchParams.get("type"); // "top" | "all"
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 12);
    const category = url.searchParams.get("category");

    const skip = (page - 1) * limit;

    const query: any = {
      content_type: "product",
      order: ["-sys.createdAt"],
      limit,
      skip,
      include: 2,
    };

    // 🔹 Top picks (ONLY if field exists)
    if (type === "top") {
      query["fields.isTopPick[exists]"] = true;
      query["fields.isTopPick"] = true;
    }

    // 🔹 Category filter
    if (category) {
      query["fields.category"] = category;
    }

    const entries = await client.getEntries(query);

    const products = entries.items.map(mapContentfulProduct);

    return NextResponse.json({
      products,
      total: entries.total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[API_PRODUCTS_ERROR]", error);

    // 🔥 ALWAYS SAFE RESPONSE
    return NextResponse.json({
      products: [],
      total: 0,
      page: 1,
      limit: 0,
    });
  }
}
