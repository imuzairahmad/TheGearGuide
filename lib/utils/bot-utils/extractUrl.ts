export function extractUrl(text?: string): string | null {
  if (!text) return null;

  const regex = /(https?:\/\/[^\s]+)/gi;

  const match = text.match(regex);

  if (!match) return null;

  return match[0].replace(/[)>.,]$/, "");
}
