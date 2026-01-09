import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function canSendToday(email: string) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `contact:${email}:${today}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60 * 60 * 24);
  }

  return count <= 2;
}
