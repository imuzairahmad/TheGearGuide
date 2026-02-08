import { EntryFieldTypes, EntrySkeletonType } from "contentful";

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
