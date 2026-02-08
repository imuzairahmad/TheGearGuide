import { Entry, EntrySkeletonType } from "contentful";
import { ProductFields, MappedProduct } from "../types/product";
import { mapScore } from "./mapScore";
import { mapFaq } from "./mapFaq";

export function mapContentfulProduct(
  entry: Entry<EntrySkeletonType>,
): MappedProduct {
  const fields = entry.fields as unknown as ProductFields;

  return {
    id: entry.sys.id,
    slug: fields.slug || entry.sys.id,
    title: fields.title,
    category: fields.category,
    subcategory: fields.subcategory,
    image: fields.image?.fields?.file?.url
      ? `https:${fields.image.fields.file.url}`
      : "/diverse-products-still-life.png",
    amazonUrl: fields.amazonUrl,
    description: fields.description ?? "",
    highlights: fields.highlights ?? [],
    specifications: fields.specifications ?? {},
    pros: fields.pros ?? "",
    cons: fields.cons ?? "",
    keyPoints: fields.keyPoints ?? "",
    question: fields.question ?? "",
    scores: Array.isArray(fields.scores) ? fields.scores.map(mapScore) : [],
    faqs: Array.isArray(fields.faqs) ? fields.faqs.map(mapFaq) : [],
  };
}
