export function buildAffiliateLink(asin: string, resolvedUrl: string): string {
  // Extract domain from resolved URL (e.g., amazon.co.uk)
  const match = resolvedUrl.match(/amazon\.([a-z.]+)/i);
  const domain = match ? match[0] : "amazon.com";

  const tag = process.env.AMAZON_PARTNER_TAG || "your-tag-20";
  return `https://www.${domain}/dp/${asin}?tag=${tag}`;
}
