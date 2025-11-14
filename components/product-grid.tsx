"use client";

import { PRODUCTS } from "@/lib/products";
import ProductCard from "./product-card";

export default function ProductGrid() {
  return (
    <section
      id="products"
      className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
            Our Top <span className="text-primary">Recommended Products</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each product is carefully selected based on quality, performance,
            and customer satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in-up">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
