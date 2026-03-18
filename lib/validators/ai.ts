import { z } from "zod";

export const FAQSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
});

export const AIProductSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  pros: z.array(z.string().min(3)).min(1),
  cons: z.array(z.string().min(3)).min(1),
  faqs: z.array(FAQSchema).min(1),
  category: z.string().min(3),
  slug: z.string().optional(),
  amazonUrl: z.string().optional(),
});

export type AIProductOutput = z.infer<typeof AIProductSchema>;
