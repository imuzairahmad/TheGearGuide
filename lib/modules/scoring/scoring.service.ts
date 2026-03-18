export function calculateScore(
  rating: number,
  reviewsCount: number,
  price: number,
  maxPrice: number,
) {
  return rating * 0.6 + (reviewsCount / 100) * 0.3 - (price / maxPrice) * 0.1;
}
