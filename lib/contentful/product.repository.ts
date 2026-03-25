import { AIProductOutput, mapContentfulProduct } from "../modules";
import { deliveryClient, managementClient } from "./client";

export async function fetchAllProducts() {
  const entries = await deliveryClient.getEntries({
    content_type: "product",
    order: ["-sys.createdAt"],
    locale: "en-US",
    include: 2,
  });

  return entries.items.map(mapContentfulProduct);
}

export async function fetchProductBySlug(slug: string) {
  const entries = await deliveryClient.getEntries({
    content_type: "product",
    "fields.slug": slug,
    limit: 1,
    locale: "en-US",
  });

  return entries.items.length ? mapContentfulProduct(entries.items[0]) : null;
}

export async function checkProductExistsBySlug(slug: string) {
  const entries = await deliveryClient.getEntries({
    content_type: "product",
    "fields.slug": slug,
    limit: 1,
    locale: "en-US",
  });

  return entries.items.length ? entries.items[0] : null;
}

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENVIRONMENT_ID = "master";

export async function createProductEntry(product: AIProductOutput) {
  const space = await managementClient.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  const slug = product.slug;

  if (!slug) {
    throw new Error("Slug is required but missing.");
  }

  // Check existing
  const existing = await env.getEntries({
    content_type: "product",
    "fields.slug": slug,
    limit: 1,
  });

  if (existing.items.length > 0) return existing.items[0];

  const entry = await env.createEntry("product", {
    fields: {
      title: { "en-US": product.title },
      description: { "en-US": product.description },
      pros: {
        "en-US": Array.isArray(product.pros)
          ? product.pros.join("\n")
          : (product.pros ?? ""),
      },
      cons: {
        "en-US": Array.isArray(product.cons)
          ? product.cons.join("\n")
          : (product.cons ?? ""),
      },
      category: { "en-US": product.category },
      amazonUrl: { "en-US": product.amazonUrl ?? "" },

      slug: { "en-US": slug },
    },
  });

  await entry.publish();
  return entry;
}
