import { PRODUCTS } from "@/lib/products";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  // console.log("params.id:", params.id);

  const productId = parseInt(resolvedParams.id, 10);

  // Check if the ID is valid
  if (isNaN(productId)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json(product);
}
