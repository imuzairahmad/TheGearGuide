export function rewriteTitle(rawTitle: string) {
  return `Amazing ${rawTitle.split("–")[0]} for Your Needs`; // Simple template
}

export function rewriteDescription(rawDescription: string) {
  return rawDescription
    ? `${rawDescription.substring(0, 250)}...`
    : "High-quality product, perfect for daily use.";
}
