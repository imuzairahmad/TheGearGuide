import { NextResponse } from "next/server";
import {
  createClient,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
} from "contentful";

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
});

export interface ScoreSkeleton extends EntrySkeletonType {
  contentTypeId: "score";
  fields: {
    label: EntryFieldTypes.Text;
    score: EntryFieldTypes.Number;
  };
}

// --- Types ---
export interface ProductFields {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  image?: { fields: { file: { url: string } } };
  amazonUrl: string;
  description?: string;
  publishedDate?: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  guidelines?: { fields: any; title: string; points: string[] }[];
  rating?: number;
  reviewsCount?: number;
  pros?: string[];
  cons?: string[];
  scores?: Entry<ScoreSkeleton>[];
}

export type MappedProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  image: string;
  amazonUrl: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  highlights?: string[];
  specifications?: Record<string, string>;
  guidelines?: { title: string; points: string[] }[];
  pros?: string[];
  cons?: string[];
  scores?: {
    label: string;
    score: number;
  }[];
};

// --- Mapper ---
export function mapContentfulProduct(
  item: Entry<EntrySkeletonType, undefined, string>,
): MappedProduct {
  const fields = item.fields as unknown as ProductFields;

  return {
    id: item.sys.id,
    slug: fields.slug || item.sys.id,
    title: fields.title,
    category: fields.category,
    subcategory: fields.subcategory,
    image: fields.image?.fields?.file?.url
      ? `https:${fields.image.fields.file.url}`
      : "/diverse-products-still-life.png",
    amazonUrl: fields.amazonUrl,
    description: fields.description ?? "",
    rating: fields.rating,
    reviewsCount: fields.reviewsCount,
    highlights: fields.highlights,
    specifications: fields.specifications,
    pros: Array.isArray(fields.pros) ? fields.pros : [],
    cons: Array.isArray(fields.cons) ? fields.cons : [],
    guidelines:
      fields.guidelines?.map((g) => ({
        title: g.fields.title,
        points: g.fields.points,
      })) ?? [],
    scores: Array.isArray(fields.scores)
      ? fields.scores.map((s) => ({
          label:
            typeof s.fields.label === "string"
              ? s.fields.label
              : (s.fields.label?.["en-US"] ?? ""),

          score:
            typeof s.fields.score === "number"
              ? s.fields.score
              : Number(s.fields.score?.["en-US"] ?? 0),
        }))
      : [],
  };
}

// --- Fetch All Products ---
export async function fetchAllProducts(): Promise<MappedProduct[]> {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    order: ["-sys.createdAt"],
    locale: "en-US",
    limit: 100,
    include: 2,
  });

  return entries.items.map(mapContentfulProduct);
}

// --- Fetch Top Picks (first 4 newest) ---
export async function fetchTopPicks(): Promise<MappedProduct[]> {
  const allProducts = await fetchAllProducts();
  return allProducts.slice(0, 4);
}

// --- API Handler ---
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // "top" or "all"

    let products: MappedProduct[] = [];

    if (type === "top") {
      products = await fetchTopPicks();
    } else {
      products = await fetchAllProducts();
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[v0] Contentful fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
