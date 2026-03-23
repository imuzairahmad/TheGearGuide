import axios from "axios";
import * as cheerio from "cheerio";

const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Random User-Agent rotation (helps avoid Amazon blocking)
function getUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

export async function scrapeProduct(originalUrl: string) {
  let url = originalUrl;

  // ✅ Resolve amzn.to short links
  if (url.includes("amzn.to")) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      url = res.url;
    } catch {}
  }

  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": getUserAgent(),
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 20000,
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        throw new Error(`Status ${response.status}`);
      }

      const html = response.data;
      const $ = cheerio.load(html);

      // ✅ Title extraction (same fallback logic)
      const title =
        $("#productTitle").text().trim() ||
        $("h1").first().text().trim() ||
        $("title").text().trim() ||
        "";

      // ✅ Feature bullets (Amazon's main "pros")
      const pros = $("#feature-bullets li span")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((t) => t.length > 10)
        .slice(0, 5);

      // ❌ Cons usually not available directly → keep empty or AI-generated later
      const cons: string[] = [];

      // 🚨 Detect bot/captcha pages
      if (
        !title ||
        title === "Amazon.com" ||
        /robot check|captcha|sorry/i.test(html)
      ) {
        throw new Error("Blocked by Amazon (captcha)");
      }

      return { title, pros, cons };
    } catch (err: any) {
      lastError = err;

      const retryable =
        err.message?.includes("timeout") ||
        err.message?.includes("ECONNRESET") ||
        err.message?.includes("Status");

      if (!retryable || attempt === MAX_RETRIES - 1) break;

      await sleep(2000 * Math.pow(2, attempt)); // exponential backoff
    }
  }

  throw new Error(`Scrape failed after retries: ${lastError?.message}`);
}
