import { Entry, EntrySkeletonType, EntryFieldTypes } from "contentful";

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

export interface FaqSkeleton extends EntrySkeletonType {
  contentTypeId: "faq";
  fields: {
    question: EntryFieldTypes.Text;
    answer: EntryFieldTypes.Text;
    order?: EntryFieldTypes.Number;
    product?: EntryFieldTypes.EntryLink<EntrySkeletonType>;
  };
}

export type MappedFaq = {
  id: string;
  question: string;
  answer: string;
};

////
export interface ScoreSkeleton extends EntrySkeletonType {
  contentTypeId: "score";
  fields: {
    label: EntryFieldTypes.Text;
    score: EntryFieldTypes.Number;
  };
}

export type MappedScore = {
  label: string;
  score: number;
};
