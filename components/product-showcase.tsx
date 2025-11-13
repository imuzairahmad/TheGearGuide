"use client";

import { useState } from "react";
import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    name: "Stanley Heritage Classic Vacuum Bottle with Handle 1.1 qt | Wide Mouth w/Leakproof Cup Lid | Keep Drinks Hot or Cold | Insulated Stainless Steel Thermal Bottle | BPA-Free | Hammertone Green",
    category: "Audio",
    price: "$199",
    image: "/image.svg",
    amazonUrl:
      "https://www.amazon.com/Stanley-Classic-Vacuum-Bottle-Hammertone/dp/B000FZX93K/?_encoding=UTF8&pd_rd_w=GOFq3&content-id=amzn1.sym.4bba068a-9322-4692-abd5-0bbe652907a9&pf_rd_p=4bba068a-9322-4692-abd5-0bbe652907a9&pf_rd_r=SQSR1CMAVM8H8D2PNCDG&pd_rd_wg=3HlKb&pd_rd_r=48e5dbad-ca7f-40ca-89d8-fe77195fb11d&ref_=pd_hp_d_btf_nta-top-picks&th=1",
    type: "Water Bottle",
  },
];

export default function ProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const currentProduct = PRODUCTS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  return (
    <section
      id="products"
      className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 "
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 animate-fade-in-up">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Featured Selection
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground text-balance">
            Premium <span className="font-semibold">Collection</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each product is selected for exceptional quality, innovative design,
            and lasting value
          </p>
        </div>

        <div className="mb-8 sm:mb-12 animate-fade-in-up">
          <div className="mb-6 sm:mb-8">
            <ProductCard
              product={currentProduct}
              isHovered={hoveredId === currentProduct.id}
              onHover={() => setHoveredId(currentProduct.id)}
              onHoverEnd={() => setHoveredId(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="lg"
              className="rounded-full transition-all duration-300 hover:scale-110 bg-transparent w-12 h-12 sm:w-auto sm:h-auto p-2 sm:p-0 flex-shrink-0"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 text-center space-y-2 w-full">
              <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap">
                {PRODUCTS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-6 sm:w-8 bg-accent"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {currentIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {PRODUCTS.length}
                </span>
              </p>
            </div>

            <Button
              onClick={handleNext}
              variant="outline"
              size="lg"
              className="rounded-full transition-all duration-300 hover:scale-110 bg-transparent w-12 h-12 sm:w-auto sm:h-auto p-2 sm:p-0 flex-shrink-0"
              aria-label="Next product"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="text-center mt-12 sm:mt-16 md:mt-20 animate-fade-in-up animate-delay-300">
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Want to explore more curated collections?
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full font-medium hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
          >
            <a
              href="https://amazon.com"
              target="_blank"
              rel="noopener noreferrer"
            >
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
      </div>
    </section>
  );
}
