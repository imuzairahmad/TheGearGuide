import "dotenv/config";
import { createClient as createDeliveryClient } from "contentful";
import { createClient as createManagementClient } from "contentful-management";

export const deliveryClient = createDeliveryClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export const managementClient = createManagementClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
});
