// app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "contentful";
import { mapContentfulProduct } from "@/lib/contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug is missing" }, { status: 400 });
    }

    const entries = await client.getEntries({
      content_type: "product",
      "fields.slug": slug,
      limit: 1,
    });

    if (!entries.items.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = mapContentfulProduct(entries.items[0]);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
