import { contentfulClient } from "../client";
import { mapContentfulProduct } from "../mappers/mapProduct";

export async function fetchAllProducts() {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    order: ["-sys.createdAt"],
    locale: "en-US",
    include: 2,
  });

  return entries.items.map(mapContentfulProduct);
}

export async function fetchProductBySlug(slug: string) {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    "fields.slug": slug,
    limit: 1,
    locale: "en-US",
  });

  return entries.items.length ? mapContentfulProduct(entries.items[0]) : null;
}
