"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  amazonUrl: string;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-card border border-border dark:border-border/50 flex flex-col h-full">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted dark:bg-muted cursor-pointer">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex-grow flex flex-col">
        <div>
          <p className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {product.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(product.rating || 0)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {product.rating}
            </span>
            {product.reviews && (
              <span className="text-xs text-muted-foreground">
                ({product.reviews})
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 sm:pt-3 mt-auto">
          <span className="text-lg sm:text-xl font-bold text-foreground">
            {product.price}
          </span>
        </div>

        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
            View on Amazon
          </a>
        </Button>
      </div>
    </Card>
  );
}
