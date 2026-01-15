"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/product-card";
import { MappedProduct } from "@/lib/contentful";
import { LoaderCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 12;

export default function SpliterPage() {
  const [allProducts, setAllProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");

  // Fetch all products once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products/list?type=all&limit=1000");
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Generate categories from all products
  const categories = useMemo(() => {
    const unique = Array.from(new Set(allProducts.map((p) => p.category)));
    return ["All", ...unique];
  }, [allProducts]);

  // Generate subcategories for selected category
  const subcategories = useMemo(() => {
    if (category === "All") return ["All"];
    const unique = Array.from(
      new Set(
        allProducts
          .filter((p) => p.category === category)
          .map((p) => p.subcategory || "Uncategorized")
      )
    );
    return ["All", ...unique];
  }, [allProducts, category]);

  // Filtered products based on category/subcategory
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const sub = p.subcategory || "Uncategorized";
      if (category !== "All" && p.category !== category) return false;
      if (subcategory !== "All" && sub !== subcategory) return false;
      return true;
    });
  }, [allProducts, category, subcategory]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  // Reset page if filter changes
  useEffect(() => {
    setPage(1);
  }, [category, subcategory]);

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center py-12">
        <LoaderCircle className="w-10 h-10 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Back & Header */}
        <div className="block md:flex items-center justify-between mb-12">
          <div>
            <Link href="/#top-picks">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="mr-2" size={18} />
                Back
              </Button>
            </Link>
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="text-sm text-muted-foreground">
              Filter by category and subcategory
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            {/* Category */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory */}
            <Select
              value={subcategory}
              onValueChange={setSubcategory}
              disabled={subcategories.length <= 1}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products */}
        {paginatedProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} source="all" />
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="outline"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              variant="outline"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
