import { productQueue } from "@/config/redis";

export async function addProductJob(url: string) {
  await productQueue.add("scrape-product", { url });
}
