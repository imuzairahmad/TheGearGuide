import { createClient } from "contentful-management";
import { logger } from "@/config/logger";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;

const client = createClient({ accessToken: CMA_TOKEN });

async function getEnv() {
  const space = await client.getSpace(SPACE_ID);
  return await space.getEnvironment(ENVIRONMENT);
}

// =========================
// ✅ GET LOCK BY ASIN
// =========================
export async function getProductLock(asin: string) {
  try {
    const env = await getEnv();

    const res = await env.getEntries({
      content_type: "productLocks",
      "fields.asin": asin, // 🔧 Changed from slug to asin
      limit: 1,
    });

    return res.items[0] || null;
  } catch (err) {
    logger.error("❌ getProductLock failed", err);
    return null;
  }
}

// =========================
// 🔥 ATOMIC LOCK (FIXES RACE CONDITION)
// =========================
export async function acquireProductLock(asin: string, productSlug?: string) {
  const env = await getEnv();

  try {
    // ✅ Check first to avoid 422 unique violation
    const existing = await getProductLock(asin);

    if (existing) {
      return {
        state: existing.fields.status["en-US"],
        lock: existing,
      };
    }

    // ✅ No lock exists — create new one
    const entry = await env.createEntry("productLocks", {
      fields: {
        asin: { "en-US": asin }, // 🔧 Store ASIN separately
        slug: { "en-US": productSlug || null }, // 🔧 Store product slug if known
        status: { "en-US": "processing" },
        createdAt: { "en-US": new Date().toISOString() },
      },
    });

    await entry.publish();

    return {
      state: "acquired",
      lock: entry,
    };
  } catch (err: any) {
    // ❌ Race condition fallback
    const isDuplicateError =
      err?.name === "ValidationFailed" ||
      err?.message?.includes("already exists") ||
      err?.details?.errors?.some((e: any) => e.name === "unique");

    if (isDuplicateError) {
      const existing = await getProductLock(asin);

      if (!existing) {
        throw new Error("Lock exists but cannot fetch");
      }

      return {
        state: existing.fields.status["en-US"],
        lock: existing,
      };
    }

    logger.error("❌ acquireProductLock failed", err);
    throw err;
  }
}

// =========================
// ✅ UPDATE STATUS & STORE SLUG
// =========================
export async function updateLockStatus(
  lock: any,
  status: "processing" | "completed" | "failed",
  productSlug?: string,
) {
  try {
    const latest = await fetchLockLatestVersion(lock.sys.id);

    latest.fields.status["en-US"] = status;

    // 🔧 Store final slug when completed
    if (productSlug && status === "completed") {
      latest.fields.slug = { "en-US": productSlug };
    }

    const updated = await latest.update();
    return await updated.publish();
  } catch (err) {
    logger.error("❌ updateLockStatus failed", err);
    throw err;
  }
}

// =========================
// ✅ FETCH LATEST VERSION
// =========================
export async function fetchLockLatestVersion(lockId: string) {
  try {
    const env = await getEnv();
    return await env.getEntry(lockId);
  } catch (err) {
    logger.error("❌ fetchLockLatestVersion failed", err);
    throw err;
  }
}

// =========================
// ✅ RETRY LOGIC (5 min timeout)
// =========================
export function canRetryLock(lock: any) {
  const lastUpdated = new Date(lock.sys.updatedAt).getTime();
  return Date.now() - lastUpdated > 5 * 60 * 1000;
}

// =========================
// ✅ GET PRODUCT SLUG FROM LOCK
// =========================
export function getLockProductSlug(lock: any): string | null {
  return lock?.fields?.slug?.["en-US"] || null;
}
