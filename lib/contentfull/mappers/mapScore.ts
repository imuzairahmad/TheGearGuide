import { Entry } from "contentful";
import { ScoreSkeleton } from "../types/score";

export function mapScore(entry: Entry<ScoreSkeleton>) {
  const { fields } = entry;

  return {
    label:
      typeof fields.label === "string"
        ? fields.label
        : (fields.label?.["en-US"] ?? ""),
    score:
      typeof fields.score === "number"
        ? fields.score
        : Number(fields.score?.["en-US"] ?? 0),
  };
}
