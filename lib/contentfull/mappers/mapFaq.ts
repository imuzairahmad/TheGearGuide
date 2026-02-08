// mapFaq.ts
import { Entry } from "contentful";
import { FaqSkeleton, MappedFaq } from "../types/faq";

export function mapFaq(entry: Entry<FaqSkeleton>): MappedFaq {
  const fields = entry.fields;
  return {
    id: entry.sys.id,
    // If localized, get en-US, otherwise fallback to string or empty
    question:
      typeof fields.question === "string"
        ? fields.question
        : (fields.question?.["en-US"] ?? ""),

    answer:
      typeof fields.answer === "string"
        ? fields.answer
        : (fields.answer?.["en-US"] ?? ""),
  };
}
