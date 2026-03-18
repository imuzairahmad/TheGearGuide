export function buildAffiliateLink(asin: string) {
  if (!asin) throw new Error("ASIN is required");
  const tag = process.env.AMAZON_PARTNER_TAG;
  if (!tag) throw new Error("Amazon partner tag not set in .env");

  // Basic Amazon US link; you can change .com to .co.uk etc if needed
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
}
