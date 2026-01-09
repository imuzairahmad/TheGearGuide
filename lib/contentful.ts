import { createClient, Entry, EntrySkeletonType } from "contentful";

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
});

export interface ProductFields {
  slug: string;
  title: string;
  category: string;
  image?: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  amazonUrl: string;
  description: string;
  isTopPick?: boolean;
  publishedDate?: string;
}

export type MappedProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  amazonUrl: string;
  description: string;
};

export function mapContentfulProduct(
  item: Entry<EntrySkeletonType, undefined, string>
): MappedProduct {
  const fields = item.fields as unknown as ProductFields;
  return {
    id: item.sys.id,
    slug: fields.slug || item.sys.id,
    title: fields.title,
    category: fields.category,
    image: fields.image?.fields?.file?.url
      ? `https:${fields.image.fields.file.url}`
      : "/diverse-products-still-life.png",
    amazonUrl: fields.amazonUrl,
    description: fields.description,
  };
}

const MIN_PRODUCTS = 2;
const DEFAULT_PRODUCTS = 4;
const MAX_PRODUCTS = 8;

export async function getTopPickProducts(): Promise<MappedProduct[]> {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    // "fields.isTopPick": true,
    // order: ["-fields.publishedDate"],
    limit: MAX_PRODUCTS,
  });

  const products = entries.items.map(mapContentfulProduct);

  if (products.length >= MAX_PRODUCTS) return products.slice(0, MAX_PRODUCTS);
  if (products.length >= DEFAULT_PRODUCTS)
    return products.slice(0, DEFAULT_PRODUCTS);
  return products.slice(0, MIN_PRODUCTS);
}
