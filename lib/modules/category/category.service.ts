export function detectCategory(title: string) {
  if (/air freshener|car scent/i.test(title)) return "Car Accessories";
  if (/headphone|earbuds/i.test(title)) return "Electronics";
  return "Miscellaneous";
}
