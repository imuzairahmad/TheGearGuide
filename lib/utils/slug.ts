export function generateSlug(title: string): string {
  const MAX_SLUG_LENGTH = 80;

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → dash
    .replace(/-+/g, "-") // collapse dashes
    .trim();

  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.substring(0, MAX_SLUG_LENGTH);
    slug = slug.substring(0, slug.lastIndexOf("-")); // cut at word boundary
  }

  return slug;
}
