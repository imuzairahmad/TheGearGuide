import { getString } from "@/lib/utils/index";
import { Entry, EntrySkeletonType } from "contentful";
import {
  FaqSkeleton,
  MappedFaq,
  MappedProduct,
  ProductFields,
  ScoreSkeleton,
} from "./product.types";
import { notNull } from "./product.validators";

export function mapFaq(entry?: Entry<FaqSkeleton> | null): MappedFaq | null {
  if (!entry || !entry.fields) return null;

  const question = getString(entry.fields.question);
  const answer = getString(entry.fields.answer);

  if (!question || !answer) return null;

  return {
    id: entry.sys.id,
    question,
    answer,
  };
}
////

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

    scores: Array.isArray(fields.scores)
      ? fields.scores.map(mapScore).filter(notNull)
      : [],

    faqs: Array.isArray(fields.faqs)
      ? fields.faqs.map(mapFaq).filter(notNull)
      : [],
  };
}

//////

export function mapScore(
  entry?: Entry<ScoreSkeleton> | null,
): { label: string; score: number } | null {
  if (!entry || !entry.fields) return null;

  const label = getString(entry.fields.label);
  const score = Number(
    typeof entry.fields.score === "number"
      ? entry.fields.score
      : Object.values(entry.fields.score ?? {})[0],
  );

  if (!label || Number.isNaN(score)) return null;

  return {
    label,
    score,
  };
}
/////
