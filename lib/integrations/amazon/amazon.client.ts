import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";

// Enhanced retry with better error logging
async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
  context = "",
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    const axiosError = err as AxiosError;

    console.error(`❌ Attempt failed${context ? ` [${context}]` : ""}:`, {
      message: error.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
    });

    if (retries === 0) throw err;

    console.log(`⏳ Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2, context);
  }
}

function getRandomUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

// Extract ASIN from various Amazon URL formats
function extractASIN(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/([A-Z0-9]{10})(?:[/?]|$)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Resolve short URLs and get final destination
async function resolveAmazonUrl(url: string): Promise<string> {
  // If it's already a full Amazon URL, return as-is
  if (
    url.includes("amazon.") &&
    !url.includes("amzn.to") &&
    !url.includes("amzn.com")
  ) {
    return url;
  }

  // Handle short links (amzn.to, amzn.com)
  if (url.includes("amzn.to") || url.includes("amzn.com")) {
    try {
      // Try with GET and better headers
      const response = await axios.get(url, {
        maxRedirects: 5,
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });

      const finalUrl = response.request?.res?.responseUrl || url;

      // If we got a 503, it's bot detection - use fallback
      if (response.status === 503) {
        console.warn("⚠️ Amazon returned 503, using ASIN fallback");
        throw new Error("Bot detection");
      }

      console.log(`🔗 Resolved short link: ${url} → ${finalUrl}`);
      return finalUrl;
    } catch (err) {
      console.log("🔧 Using ASIN fallback for short link");

      // Fallback: Try to call the short link API or extract from common patterns
      // For now, construct a search URL or return with indicator
      // Since we can't resolve, we'll try amazon.com as default
      return url; // Return original, will try to scrape directly
    }
  }

  return url;
}

async function fetchHTML(
  url: string,
): Promise<{ html: string; finalUrl: string }> {
  return retry(
    async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      // Resolve short links and get final URL
      const resolvedUrl = await resolveAmazonUrl(url);

      console.log(`🔍 Fetching: ${resolvedUrl}`);

      try {
        const res = await axios.get(resolvedUrl, {
          signal: controller.signal,
          timeout: 15000,
          maxRedirects: 5,
          headers: {
            "User-Agent": getRandomUserAgent(),
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
            DNT: "1",
          },
          decompress: true,
          validateStatus: () => true,
        });

        clearTimeout(timeout);

        const finalUrl = res.request?.res?.responseUrl || resolvedUrl;
        console.log(`📊 Response status: ${res.status}`);
        console.log(`🌐 Final URL: ${finalUrl}`);

        const html = res.data as string;

        // Enhanced bot detection checks
        const botIndicators = [
          "captcha",
          "robot check",
          "type the characters",
          "sorry, we just need to make sure you're not a robot",
          "enter the characters you see below",
          "to discuss automated access",
          "api-services-support@amazon.com",
          "ref=cs_503_link",
        ];

        const detectedIndicator = botIndicators.find((indicator) =>
          html.toLowerCase().includes(indicator.toLowerCase()),
        );

        if (detectedIndicator) {
          throw new Error(`Bot detection triggered: "${detectedIndicator}"`);
        }

        if (res.status !== 200) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        return { html, finalUrl };
      } catch (err: unknown) {
        clearTimeout(timeout);
        throw err;
      }
    },
    3,
    2000,
    "fetchHTML",
  );
}

export async function scrapeProduct(url: string) {
  try {
    const { html, finalUrl } = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Extract ASIN from final resolved URL
    const asin = extractASIN(finalUrl);
    console.log(`🆔 Extracted ASIN: ${asin || "NOT FOUND"}`);

    console.log(`🧪 Page title: ${$("title").text()}`);
    console.log(`🧪 Has #productTitle: ${$("#productTitle").length > 0}`);
    console.log(`🧪 Has #feature-bullets: ${$("#feature-bullets").length > 0}`);

    const titleSelectors = [
      "#productTitle",
      "#title",
      "h1[data-automation-id='title']",
      "meta[property='og:title']",
      "h1.a-size-large.a-spacing-none",
      "h1 span",
      "[data-testid='product-title']",
    ];

    let title = "";
    for (const selector of titleSelectors) {
      const element = $(selector).first();
      const text =
        element.text()?.trim() || element.attr("content")?.trim() || "";
      if (text && text.length > 3 && !text.includes("Amazon")) {
        title = text;
        console.log(
          `✅ Title found via "${selector}": ${title.substring(0, 50)}...`,
        );
        break;
      }
    }

    const pros: string[] = [];
    const bulletSelectors = [
      "#feature-bullets ul li span",
      "#feature-bullets ul li",
      "#feature-bullets li",
      ".a-unordered-list.a-nostyle li",
      "[data-feature-name='featurebullets'] li",
      "#bullets_feature_div li",
      "[data-testid='feature-bullets'] li",
    ];

    for (const selector of bulletSelectors) {
      const items = $(selector)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(
          (t) =>
            t &&
            t.length > 5 &&
            !t.includes("Make sure") &&
            !t.includes("See more") &&
            !t.includes("›"),
        );

      if (items.length > 0) {
        pros.push(...items.slice(0, 5));
        console.log(`✅ Found ${items.length} bullets via "${selector}"`);
        break;
      }
    }

    if (!title) {
      const pageTitle = $("title").text();
      const bodyText = $("body").text();
      const bodySnippet = bodyText.substring(0, 200);
      throw new Error(
        `Failed to extract title. Page title: "${pageTitle}". Body snippet: "${bodySnippet}..."`,
      );
    }

    // Return ASIN so worker can use it for locks
    return { title, pros, cons: [], asin, finalUrl };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));

    console.error("💥 scrapeProduct failed:", {
      message: error.message,
      stack: error.stack,
      url: url,
    });

    throw {
      message: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    };
  }
}
