"use client";

import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import { MappedProduct } from "@/lib/contentful";
import { LoaderCircle } from "lucide-react";

export default function ProductGrid() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("[v0] Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">
              <LoaderCircle />
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
