import { QueueEvents } from "bullmq";
import { redisConnection } from "@/config/redis";

export const productQueueEvents = new QueueEvents("product-scrape", {
  connection: redisConnection,
});
