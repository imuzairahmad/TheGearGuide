import { managementClient } from "./client";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENV = "master";

async function getEnv() {
  const space = await managementClient.getSpace(SPACE_ID);
  return await space.getEnvironment(ENV);
}

/**
 * ✅ ATOMIC DEDUP
 * - Returns true → first time (process it)
 * - Returns false → duplicate (skip)
 */
export async function markMessageProcessedAtomic(messageId: string) {
  const env = await getEnv();

  try {
    const entry = await env.createEntry("webhookLog", {
      fields: {
        messageId: { "en-US": messageId },
      },
    });

    await entry.publish();

    return true; // ✅ first time
  } catch (err: any) {
    // ⚠️ Contentful duplicate / validation error
    if (
      err?.name === "ValidationFailed" ||
      err?.message?.includes("already exists")
    ) {
      return false; // ❌ duplicate
    }

    // Unexpected error → rethrow
    throw err;
  }
}
