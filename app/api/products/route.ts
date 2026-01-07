export const dynamic = "force-dynamic";
import { contentfulClient, mapContentfulProduct } from "@/lib/contentful";

export async function GET() {
  try {
    const response = await contentfulClient.getEntries({
      content_type: "product",
    });

    const products = response.items.map((item) => mapContentfulProduct(item));
    return Response.json(products);
  } catch (error) {
    console.error("[v0] Contentful fetch error:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
