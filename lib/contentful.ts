import { createClient, Entry, EntrySkeletonType } from "contentful";

export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
});

// Keep only the types needed for internal Contentful mapping
export interface ProductFields {
  id: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  reviewsCount: number;
  image: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  amazonUrl: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  slug: string;
}

export type MappedProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: string;
  rating: number;
  reviewsCount: number;
  image: string;
  amazonUrl: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
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
    price: fields.price,
    rating: fields.rating,
    reviewsCount: fields.reviewsCount,
    image: fields.image?.fields?.file?.url
      ? `https:${fields.image.fields.file.url}`
      : "/diverse-products-still-life.png",
    amazonUrl: fields.amazonUrl,
    description: fields.description,
    features: fields.features || [],
    specs: fields.specs || {},
    pros: fields.pros || [],
    cons: fields.cons || [],
  };
}
