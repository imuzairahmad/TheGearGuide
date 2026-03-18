export interface AIProductOutput {
  title: string;
  description: string;
  slug?: string;
  pros: string[];
  cons: string[];
  faqs: { question: string; answer: string }[];
  category: string;
  keyPoints?: string;
  question?: string;
  amazonUrl?: string;
  highlights?: string[];
  specifications?: Record<string, any>;
  scores?: number[];
}
