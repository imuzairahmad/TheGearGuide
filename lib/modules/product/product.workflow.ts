import { logger } from "@/config/logger";
import { createProductEntry } from "@/lib/contentful";
import { generateProductContent, scrapeProduct } from "@/lib/integrations";
import { AIProductOutput } from "./product.ai";

interface ProcessProductInput {
  url: string;
}

export async function scrapeGenerateAndCreate(input: ProcessProductInput) {
  if (!input.url) throw new Error("Product URL is required");

  logger.info("Processing product", { url: input.url });

  // 1️⃣ Scrape product
  const scraped = await scrapeProduct(input.url);

  // 2️⃣ Generate AI content
  const aiData: AIProductOutput = await generateProductContent(scraped.title);

  // Merge scraped pros/cons if AI output is empty
  if (!aiData.pros?.length) aiData.pros = scraped.pros;
  if (!aiData.cons?.length) aiData.cons = scraped.cons;

  // 3️⃣ Add amazonUrl for Contentful
  aiData.amazonUrl = input.url;

  // 4️⃣ Create Contentful entry
  const entry = await createProductEntry(aiData);

  logger.info("Product successfully created", { id: entry.sys.id });

  return entry;
}
