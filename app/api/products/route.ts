import { PRODUCTS } from "@/lib/products";

export async function GET() {
  return Response.json(PRODUCTS);
}
