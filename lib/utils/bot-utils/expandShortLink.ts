import axios from "axios";

export async function expandShortLink(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: () => true,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const finalUrl =
      response.request?.res?.responseUrl || response.request?.path || url;
    return finalUrl;
  } catch (err) {
    console.error("Short link expansion failed:", err);
    return url;
  }
}
