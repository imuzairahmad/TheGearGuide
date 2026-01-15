"use client";
import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import { MappedProduct } from "@/lib/contentful";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  type?: "top" | "all";
}

const PAGE_SIZE = 4;

export default function ProductGrid({ type = "top" }: ProductGridProps) {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `/api/products/list?type=${type}&page=${page}&limit=${PAGE_SIZE}`
        );
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, page]);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="animate-spin w-8 h-8" />
      </div>
    );

  if (!products.length)
    return <p className="text-center py-16">No products found.</p>;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            ⭐ Our Top Picks
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} source={type} />
          ))}
        </div>

        {/* Pagination for ALL products only */}
        {type === "all" && total > PAGE_SIZE && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map(
              (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
