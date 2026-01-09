"use client";

import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import type { MappedProduct } from "@/lib/contentful";
import { LoaderCircle } from "lucide-react";

export default function ProductGrid() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data: MappedProduct[] = await response.json();
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto flex justify-center">
          <LoaderCircle className="animate-spin text-muted-foreground w-10 h-10" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="top-picks"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            ⭐ Our Top Picks
          </h2>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground mt-8">
            No top picks available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
