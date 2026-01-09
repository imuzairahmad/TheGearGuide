"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/product-card";
import { MappedProduct } from "@/lib/contentful";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpliterPage() {
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
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/top-picks">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2" size={20} />
              Back to Products
            </Button>
          </Link>
          <div className="flex items-center justify-center py-16">
            <span className="text-muted-foreground">
              <LoaderCircle />
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <Link href="/#top-picks">
            <Button variant="ghost">
              <ArrowLeft className="mr-2" size={20} />
              Back to Products
            </Button>
          </Link>
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold">⭐ Products:</h2>
          </div>
          <div>
            <h1 className="text-2xl">Comming soon):</h1>
          </div>
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
