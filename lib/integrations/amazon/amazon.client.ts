// lib/product/cheerioScraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

// =========================
// ✅ RETRY HELPER
// =========================
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2); // exponential backoff
  }
}

// =========================
// ✅ RANDOM USER AGENT
// =========================
function getRandomUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Firefox/117.0",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

// =========================
// ✅ FETCH HTML
// =========================
async function fetchHTML(url: string): Promise<string> {
  return retry(async () => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await axios.get(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Referer: "https://www.amazon.com/",
      },
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      throw new Error(`Bad status: ${res.status}`);
    }

    return res.data;
  }, 3); // 3 retries
}

// =========================
// ✅ SCRAPER
// =========================
export async function scrapeProduct(url: string) {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  // Get title
  const title =
    $("#productTitle").text().trim() ||
    $("meta[name='title']").attr("content") ||
    $("title").text().trim() ||
    "";

  // Get pros / features
  const pros = $("#feature-bullets li span")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 5)
    .slice(0, 5);

  // Cons are often not present, fallback empty
  const cons: string[] = [];

  if (!title || title === "Amazon.com") {
    throw new Error("Failed to scrape product or bot detected");
  }

  return { title, pros, cons };
}
