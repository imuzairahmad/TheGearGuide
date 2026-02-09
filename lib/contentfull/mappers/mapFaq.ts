import { Entry } from "contentful";
import { FaqSkeleton, MappedFaq } from "../types/faq";
import { getString } from "../getString";

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
