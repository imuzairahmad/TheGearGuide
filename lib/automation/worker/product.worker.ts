// import "dotenv/config";
// import { Worker, Job } from "bullmq";
// import { redisConnection } from "@/config/redis";
// import { logger } from "@/config/logger";
// import { scrapeProduct, generateProductContent } from "@/lib/integrations";
// import { createProductEntry } from "@/lib/contentful";
// import { sendMessage } from "@/lib/integrations";

// interface WorkerJobData {
//   url: string;
//   asin: string;
//   slug: string;
//   affiliateLink: string;
//   from: string;
// }

// const worker = new Worker(
//   "product-scrape",
//   async (job: Job<WorkerJobData>) => {
//     const { url, affiliateLink, from } = job.data;

//     try {
//       logger.info("Worker started for product", { url, jobId: job.id });

//       const scraped = await scrapeProduct(url);
//       const aiData = await generateProductContent(scraped.title);

//       // Fallbacks
//       aiData.pros = (
//         aiData.pros.length ? aiData.pros : (scraped.pros ?? [])
//       ).slice(0, 3);
//       aiData.cons = (
//         aiData.cons.length ? aiData.cons : (scraped.cons ?? [])
//       ).slice(0, 3);

//       // ✅ Store affiliate link in Contentful
//       aiData.amazonUrl = affiliateLink;

//       const entry = await createProductEntry(aiData);

//       const fields = entry.fields as { slug?: { "en-US": string } };
//       const finalSlug = fields.slug?.["en-US"];
//       if (!finalSlug) throw new Error("Slug missing");

//       const finalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${finalSlug}?source=all`;

//       // 🔥 Send final WhatsApp message
//       await sendMessage(from, `🔥 Your product is ready:\n\n${finalUrl}`);

//       logger.info("Product created successfully", {
//         slug: finalSlug,
//         jobId: job.id,
//       });

//       return { success: true };
//     } catch (err) {
//       logger.error("Worker failed", {
//         jobId: job.id,
//         error: err instanceof Error ? err.message : err,
//       });
//       await sendMessage(from, "❌ Failed to create product. Please try again.");
//       throw err;
//     }
//   },
//   { connection: redisConnection, concurrency: 1 },
// );

// worker.on("completed", (job) =>
//   logger.info("Job completed", { jobId: job.id }),
// );
// worker.on("failed", (job, err) =>
//   logger.error("Job failed", { jobId: job?.id, error: err.message }),
// );
