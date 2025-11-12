"use client";

import { Card } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  amazonUrl: string;
  type: string;
}

interface ProductCardProps {
  product: Product;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
}

export default function ProductCard({
  product,
  isHovered,
  onHover,
  onHoverEnd,
}: ProductCardProps) {
  return (
    <a
      href={product.amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className="group block h-full"
    >
      <Card className="overflow-hidden hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-500 cursor-pointer h-full flex flex-col bg-card dark:bg-card/50 border border-border dark:border-border/50 hover:border-accent/50 dark:hover:border-accent/30">
        <div className="relative overflow-hidden bg-muted aspect-square sm:aspect-video md:aspect-square flex-shrink-0">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-500 transform ${
              isHovered
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }`}
          >
            {product.price}
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-5 space-y-3 flex-grow flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {product.category}
            </p>
            <span className="text-xs bg-accent/10 dark:bg-accent/20 text-accent px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              {product.type}
            </span>
          </div>

          <h3
            className={`text-base sm:text-lg font-semibold text-foreground transition-colors duration-300 line-clamp-2 ${
              isHovered ? "text-accent" : "text-foreground"
            }`}
          >
            {product.name}
          </h3>

          <div
            className={`flex items-center text-xs sm:text-sm font-medium transition-all duration-500 mt-auto pt-2 ${
              isHovered ? "text-accent translate-x-1" : "text-muted-foreground"
            }`}
          >
            View on Amazon
            <svg
              className={`ml-2 w-4 h-4 transition-transform duration-500 ${
                isHovered ? "translate-x-1" : ""
              }`}
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
          </div>
        </div>
      </Card>
    </a>
  );
}
