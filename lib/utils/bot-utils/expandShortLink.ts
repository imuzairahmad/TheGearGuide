import axios from "axios";

export async function expandShortLink(url: string): Promise<string> {
  // If not a short link, return as-is
  if (!url.includes("amzn.to") && !url.includes("amzn.com")) {
    return url;
  }

  // 🔥 Amazon blocks HEAD requests from datacenters with 503
  // Skip expansion and let the scraper handle it with browser-like headers
  console.log(
    "⏭️ Skipping short link expansion (Amazon blocks datacenter IPs)",
  );
  return url;
}
