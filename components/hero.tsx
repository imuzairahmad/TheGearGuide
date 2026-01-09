"use client";

import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "./ui/background-ripple-effect";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-background via-background to-background dark:from-background dark:via-background/95 dark:to-background px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <BackgroundRippleEffect rows={12} />
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 -mt-18">
        <div className="inline-block animate-fade-in-up animate-delay-100">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest letter-spacing-wide">
            ✨ Curated Amazon Products Affiliation
          </p>
        </div>
        <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tighter text-foreground text-balance leading-tight animate-fade-in-up animate-delay-200">
          Amazon{" "}
          <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Product
          </span>{" "}
          <br className="hidden md:block" />
          Affiliation
        </h1>

        {/* <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up animate-delay-300">
          A curated selection of premium products chosen for quality and value.
          Click any product to view and purchase it on Amazon.
        </p> */}

        {/* <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up animate-delay-400">
          <Button
            size="lg"
            className="rounded-full font-medium hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Collection
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
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full font-medium hover:scale-105 transition-transform duration-300 bg-transparent w-full sm:w-auto"
            asChild
          >
            <a
              href="https://amazon.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browse Amazon
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
        </div> */}
      </div>
    </section>
  );
}
