import crypto from "crypto";
import { productQueue } from "@/config/redis";

export interface ProductQueueJob {
  url: string;
  asin: string;
  slug: string;
  affiliateLink: string;
  from: string;
}

function generateJobId(asin: string) {
  return crypto.createHash("md5").update(asin).digest("hex");
}

export async function addProductToQueue(data: ProductQueueJob) {
  const jobData = {
    ...data,
    from: data.from ?? "unknown",
  };

  const jobId = generateJobId(jobData.asin);

  // 🔥 HARD BLOCK duplicate jobs
  const existingJob = await productQueue.getJob(jobId);
  if (existingJob) {
    return { status: "duplicate" };
  }

  // ✅ ADD JOB
  await productQueue.add("product-scrape", data, {
    jobId,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  });

  return { status: "new" };
}
