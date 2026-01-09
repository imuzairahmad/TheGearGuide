// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getTopPickProducts } from "@/lib/contentful";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getTopPickProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("[v0] Contentful fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
