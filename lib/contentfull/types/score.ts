import { EntryFieldTypes, EntrySkeletonType } from "contentful";

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
