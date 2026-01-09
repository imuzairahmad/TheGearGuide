// app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { contentfulClient, mapContentfulProduct } from "@/lib/contentful";
export const revalidate = 3600;

export async function GET(
  request: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;

  try {
    const response = await contentfulClient.getEntries({
      content_type: "product",
      "fields.slug": slug,
      limit: 1,
    });

    if (!response.items.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = mapContentfulProduct(response.items[0]);

    return NextResponse.json(product);
  } catch (error) {
    console.error("[Contentful] product fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
