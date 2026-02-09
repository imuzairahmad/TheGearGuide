import { Entry } from "contentful";
import { ScoreSkeleton } from "../types/score";
import { getString } from "../getString";

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
