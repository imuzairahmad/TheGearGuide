"use client";

import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "./ui/background-ripple-effect";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
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
      </div>
    </section>
  );
}
