"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LoaderCircle, ArrowLeft, ArrowRight } from "lucide-react";
import type { MappedProduct } from "@/lib/contentful";

const PAGE_SIZE = 12;

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromURL = Number(searchParams.get("page") || 1);

  const [page, setPage] = useState(pageFromURL);
  const [allProducts, setAllProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");

  /* ---------------------------------- fetch --------------------------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/list?type=all&limit=1000");
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* --------------------------- keep page in sync ---------------------------- */
  useEffect(() => {
    setPage(pageFromURL);
  }, [pageFromURL]);

  /* ------------------------------- categories -------------------------------- */
  const categories = useMemo(
    () => ["All", ...new Set(allProducts.map((p) => p.category))],
    [allProducts]
  );

  const subcategories = useMemo(() => {
    if (category === "All") return ["All"];
    return [
      "All",
      ...new Set(
        allProducts
          .filter((p) => p.category === category)
          .map((p) => p.subcategory || "Uncategorized")
      ),
    ];
  }, [allProducts, category]);

  /* ------------------------------- filtering -------------------------------- */
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (
        subcategory !== "All" &&
        (p.subcategory || "Uncategorized") !== subcategory
      )
        return false;
      return true;
    });
  }, [allProducts, category, subcategory]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  /* ------------------------------- pagination -------------------------------- */
  const changePage = (p: number) => {
    setPage(p);
    router.push(`/products?page=${p}`);
  };

  useEffect(() => {
    setPage(1);
    router.push("/products?page=1");
  }, [category, subcategory]);

  /* ---------------------------------- UI ---------------------------------- */
  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <div>
            <Link href="/#top-picks">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2" size={18} />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-sm text-muted-foreground">
              Browse by category and subcategory
            </p>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={subcategory}
              onValueChange={setSubcategory}
              disabled={subcategories.length <= 1}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* grid */}
        {paginatedProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} source="all" />
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              <ArrowLeft />
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
            >
              <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
