import { managementClient } from "./client";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENV = "master";

async function getEnv() {
  const space = await managementClient.getSpace(SPACE_ID);
  return await space.getEnvironment(ENV);
}

export async function isMessageProcessed(messageId: string) {
  const env = await getEnv();

  const res = await env.getEntries({
    content_type: "webhookLog",
    "fields.messageId": messageId,
    limit: 1,
  });

  return res.items.length > 0;
}

export async function markMessageProcessed(messageId: string) {
  const env = await getEnv();

  try {
    const entry = await env.createEntry("webhookLog", {
      fields: {
        messageId: { "en-US": messageId },
      },
    });

    await entry.publish();
  } catch {
    console.warn("Duplicate message avoided");
  }
}
