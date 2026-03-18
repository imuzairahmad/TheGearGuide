import axios from "axios";
import { AIProductSchema, AIProductOutput } from "@/lib/validators";
import { safeJSONParse } from "@/lib/utils/index";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = "mistralai/mistral-small-3.1-24b-instruct";
const MAX_RETRIES = 3;

export async function generateProductContent(
  productText: string,
): Promise<AIProductOutput> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: MODEL,
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `STRICT JSON OUTPUT ONLY.

Return:
{
  "title": string,
  "description": string,
  "pros": string[],
  "cons": string[],
  "faqs": [
    { "question": string, "answer": string }
  ],
  "category": string,
  "subcategory": string (optional)
}`,
            },
            {
              role: "user",
              content: `Generate product content from:\n${productText}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const parsed = safeJSONParse(content);
      const validated = AIProductSchema.parse(parsed);

      // Hard guarantees
      while (validated.cons.length < 2) {
        validated.cons.push("Limited detailed specification available");
      }

      while (validated.pros.length < 4) {
        validated.pros.push("User-friendly design");
      }

      while (validated.faqs.length < 3) {
        validated.faqs.push({
          question: "Is this product easy to use?",
          answer: "Yes, it is designed for simple and intuitive operation.",
        });
      }

      return validated;
    } catch (err: any) {
      if (attempt === MAX_RETRIES - 1) {
        throw new Error("All models failed: " + err.message);
      }
    }
  }

  throw new Error("Unexpected AI failure");
}
