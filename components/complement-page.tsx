import { Button } from "./ui/button";

export default function ComplementPage() {
  return (
    <div className="text-center  my-12 sm:my-16 md:my-20 animate-fade-in-up animate-delay-300 mx-5">
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
        Want to explore more curated collections?
      </p>
      <Button
        asChild
        size="lg"
        className="rounded-full font-medium hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
      >
        <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">
          Visit Amazon Store
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </Button>
    </div>
  );
}
