import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonLink(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(data);

    const amazonLinks: string[] = [];

    function normalizeLink(href: string): string | null {
      try {
        // decode redirect links like /go?url=
        if (href.includes("url=")) {
          const parts = href.split("url=");
          if (parts[1]) {
            href = decodeURIComponent(parts[1]);
          }
        }

        href = decodeURIComponent(href);

        if (href.includes("amazon.") || href.includes("amzn.to")) {
          return href;
        }

        return null;
      } catch {
        return null;
      }
    }

    /*
    --------------------------------
    STEP 1 (PRO TIP)
    Look for Amazon buttons first
    --------------------------------
    */
    const buttonSelectors = [
      ".buy-button a",
      ".amazon-button a",
      ".btn-amazon a",
      ".button a",
      "a[href*='amzn.to']",
    ];

    for (const selector of buttonSelectors) {
      const el = $(selector).first();

      if (el.length) {
        const href = el.attr("href");
        if (!href) continue;

        const normalized = normalizeLink(href);
        if (normalized) return normalized;
      }
    }

    /*
    --------------------------------
    STEP 2
    Scan all links if button not found
    --------------------------------
    */
    $("a").each((_, el) => {
      const href = $(el).attr("href");

      if (!href) return;

      const normalized = normalizeLink(href);

      if (!normalized) return;

      if (
        normalized.includes("/dp/") ||
        normalized.includes("/gp/product/") ||
        normalized.includes("amzn.to")
      ) {
        amazonLinks.push(normalized);
      }
    });

    if (amazonLinks.length === 0) return null;

    /*
    --------------------------------
    STEP 3
    Prefer direct product pages
    --------------------------------
    */
    const productLink = amazonLinks.find(
      (link) => link.includes("/dp/") || link.includes("/gp/product/"),
    );

    return productLink || amazonLinks[0];
  } catch (error) {
    console.error("Scraping error:", error);
    return null;
  }
}
