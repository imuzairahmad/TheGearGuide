import { revalidatePath } from "next/cache";

export async function POST() {
  revalidatePath("/products");
  return Response.json({ revalidated: true });
}
// console.log("FETCH TIME:", new Date().toISOString());
