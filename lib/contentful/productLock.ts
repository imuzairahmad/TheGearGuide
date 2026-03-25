import { createClient } from "contentful-management";
import { logger } from "@/config/logger";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const client = createClient({ accessToken: CMA_TOKEN });

export async function getProductLock(slug: string) {
  try {
    const env = await client
      .getSpace(SPACE_ID)
      .then((space) => space.getEnvironment(ENVIRONMENT));
    const entries = await env.getEntries({
      content_type: "productLocks",
      "fields.slug": slug,
    });
    return entries.items[0];
  } catch (err) {
    logger.error("❌ getProductLock failed", err);
    return null;
  }
}

export async function createProcessingLock(slug: string) {
  try {
    const env = await client
      .getSpace(SPACE_ID)
      .then((space) => space.getEnvironment(ENVIRONMENT));
    const entry = await env.createEntry("productLocks", {
      fields: {
        slug: { "en-US": slug },
        status: { "en-US": "processing" },
      },
    });
    await entry.publish();
    return entry;
  } catch (err) {
    logger.error("❌ createProcessingLock failed", err);
    throw err;
  }
}

export async function updateLockStatus(
  lock: any,
  status: "processing" | "completed" | "failed",
) {
  try {
    const latestLock = await fetchLockLatestVersion(lock.sys.id);
    latestLock.fields.status["en-US"] = status;
    const updated = await latestLock.update();
    await updated.publish();
    return updated;
  } catch (err) {
    logger.error("❌ updateLockStatus failed", err);
    throw err;
  }
}

// =========================
// ✅ FETCH LATEST VERSION (AVOIDS 409)
// =========================
export async function fetchLockLatestVersion(lockId: string) {
  try {
    const env = await client
      .getSpace(SPACE_ID)
      .then((space) => space.getEnvironment(ENVIRONMENT));
    const entry = await env.getEntry(lockId);
    return entry;
  } catch (err) {
    logger.error("❌ fetchLockLatestVersion failed", err);
    throw err;
  }
}

export function canRetryLock(lock: any) {
  const lastUpdated = new Date(lock.sys.updatedAt);
  const now = new Date();
  // Retry if last update was more than 5 minutes ago
  return now.getTime() - lastUpdated.getTime() > 5 * 60 * 1000;
}
