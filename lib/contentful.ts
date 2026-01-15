import { NextResponse } from "next/server";
import { createClient, Entry, EntrySkeletonType } from "contentful";

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
});

// --- Types ---
export interface ProductFields {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  image?: { fields: { file: { url: string } } };
  amazonUrl: string;
  description: string;
  publishedDate?: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  guidelines?: { fields: any; title: string; points: string[] }[];
  rating?: number;
  reviewCount?: number;
}

export type MappedProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  image: string;
  amazonUrl: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  specifications?: Record<string, string>;
  guidelines?: { title: string; points: string[] }[];
};

// --- Mapper ---
export function mapContentfulProduct(
  item: Entry<EntrySkeletonType, undefined, string>
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
    description: fields.description,
    rating: fields.rating,
    reviewCount: fields.reviewCount,
    highlights: fields.highlights,
    specifications: fields.specifications,
    guidelines:
      fields.guidelines?.map((g) => ({
        title: g.fields.title,
        points: g.fields.points,
      })) ?? [],
  };
}

// --- Fetch All Products ---
export async function fetchAllProducts(): Promise<MappedProduct[]> {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    order: ["-sys.createdAt"], // newest first
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
      { status: 500 }
    );
  }
}
