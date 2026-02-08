import { Entry, EntrySkeletonType } from "contentful";
import { ScoreSkeleton } from "./score";
import { FaqSkeleton, MappedFaq } from "./faq";

export interface ProductFields {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  image?: { fields: { file: { url: string } } };
  amazonUrl: string;
  description?: string;
  highlights?: string[];
  specifications?: Record<string, string>;
  pros?: string;
  cons?: string;
  keyPoints?: string;
  question?: string;
  scores?: Entry<ScoreSkeleton>[];
  faqs?: Entry<FaqSkeleton>[];
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
  highlights?: string[];
  specifications?: Record<string, string>;
  pros?: string;
  cons?: string;
  keyPoints?: string;
  question?: string;
  scores?: {
    label: string;
    score: number;
  }[];
  faqs?: MappedFaq[];
};
