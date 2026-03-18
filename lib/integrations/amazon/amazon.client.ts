import puppeteer from "puppeteer";

const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeProduct(originalUrl: string) {
  let url = originalUrl;

  // Resolve amzn.to short links
  if (url.includes("amzn.to")) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      url = res.url;
    } catch {}
  }

  let lastError: any;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      );
      await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (["image", "font", "media"].includes(req.resourceType()))
          req.abort();
        else req.continue();
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      const title =
        (await page
          .$eval("#productTitle", (el) => el.textContent?.trim())
          .catch(() => null)) ||
        (await page
          .$eval("h1", (el) => el.textContent?.trim())
          .catch(() => null)) ||
        (await page.title()) ||
        "";

      const pageText = await page.evaluate(() => document.body.innerText);
      const lines = pageText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const pros: string[] = [];
      const cons: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const lower = lines[i].toLowerCase();
        if (lower.startsWith("pros") && lines[i + 1]) pros.push(lines[i + 1]);
        if (lower.startsWith("cons") && lines[i + 1]) cons.push(lines[i + 1]);
      }

      await browser.close();
      return { title, pros, cons };
    } catch (err: any) {
      await browser.close();
      lastError = err;
      const retryable =
        err.message?.includes("ECONNRESET") ||
        err.message?.includes("Navigation timeout") ||
        err.message?.includes("net::ERR");
      if (!retryable || attempt === MAX_RETRIES - 1) break;
      await sleep(2000 * Math.pow(2, attempt));
    }
  }

  throw new Error(`Scrape failed after retries: ${lastError?.message}`);
}
