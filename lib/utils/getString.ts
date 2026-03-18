// lib/contentful/getString.ts
export function getString(value: unknown): string {
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const firstValue = Object.values(value)[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return "";
}
