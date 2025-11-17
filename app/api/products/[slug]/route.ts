import { contentfulClient, mapContentfulProduct } from "@/lib/contentful";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // FIX: params is a Promise

  try {
    const response = await contentfulClient.getEntries({
      content_type: "product",
      "fields.slug": slug,
      limit: 1,
    });

    if (!response.items.length) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const product = mapContentfulProduct(response.items[0]);

    return Response.json(product);
  } catch (error) {
    console.error("[Contentful] product fetch error:", error);

    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
