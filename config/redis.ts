import { Queue } from "bullmq";
import IORedis from "ioredis";

if (!process.env.REDIS_URL) throw new Error("REDIS_URL not defined");

export const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false, // avoids INFO command
  lazyConnect: true,
});

export const productQueue = new Queue("product-scrape", {
  connection: redisConnection,
});
