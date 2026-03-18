import { AIProductOutput } from "@/lib/validators";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils/notNull.ts
export function notNull<T>(value: T | null): value is T {
  return value !== null;
}

export function validateProduct(data: AIProductOutput) {
  if (!data.title) throw new Error("Missing title");

  if (!Array.isArray(data.pros) || data.pros.length < 3)
    throw new Error("Invalid pros");

  if (!Array.isArray(data.cons)) throw new Error("Invalid cons");

  if (!Array.isArray(data.faqs)) throw new Error("Invalid FAQs");
}
