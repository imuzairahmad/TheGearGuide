export function generateFAQs(title: string, reviewsHighlights: any) {
  return [
    {
      question: "Who is this product for?",
      answer: reviewsHighlights.forUsers.join(", "),
    },
    {
      question: "Who should avoid?",
      answer: reviewsHighlights.forAvoid.join(", "),
    },
  ];
}
