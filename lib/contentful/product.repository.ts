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
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await environment.getEntries({
    content_type: "product",
    "fields.slug": slug,
    limit: 1,
  });

  if (existing.items.length > 0) {
    return existing.items[0];
  }

  // // 1️⃣ Create FAQ entries
  // const faqEntries: any[] = [];
  // if (Array.isArray(product.faqs)) {
  //   for (const f of product.faqs) {
  //     const faqEntry = await environment.createEntry("faq", {
  //       fields: {
  //         question: { "en-US": f.question },
  //         answer: { "en-US": f.answer },
  //       },
  //     });
  //     await faqEntry.publish();
  //     faqEntries.push(faqEntry);
  //   }
  // }

  const entry = await environment.createEntry("product", {
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
      // faqs: {
      //   "en-US": faqEntries.map((e) => ({
      //     sys: { type: "Link", linkType: "Entry", id: e.sys.id },
      //   })),
      // },
      category: { "en-US": product.category },
      amazonUrl: { "en-US": product.amazonUrl ?? "" },
      slug: { "en-US": slug },
    },
  });

  await entry.publish();
  return entry;
}
