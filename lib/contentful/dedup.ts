import { managementClient } from "./client";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENVIRONMENT_ID = "master";

export async function isMessageProcessed(messageId: string) {
  const space = await managementClient.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  const entries = await env.getEntries({
    content_type: "webhookLog",
    "fields.messageId": messageId,
    limit: 1,
  });

  return entries.items.length > 0;
}

export async function markMessageProcessed(messageId: string) {
  const space = await managementClient.getSpace(SPACE_ID);
  const env = await space.getEnvironment(ENVIRONMENT_ID);

  const entry = await env.createEntry("webhookLog", {
    fields: {
      messageId: { "en-US": messageId },
    },
  });

  await entry.publish();
}
