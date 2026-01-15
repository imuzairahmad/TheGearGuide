"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ArrowLeft, LoaderCircle } from "lucide-react";
import type { MappedProduct } from "@/lib/contentful";

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const source = searchParams.get("source") || "all";

  const [product, setProduct] = useState<MappedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product by slug
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading)
    return (
      <main className="min-h-screen bg-background px-4 py-8 flex justify-center items-center">
        <LoaderCircle className="animate-spin w-10 h-10 text-muted-foreground" />
      </main>
    );

  if (error || !product)
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );

  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const category = product.category || "Uncategorized";
  const subcategory = product.subcategory || "Uncategorized";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() =>
            router.push(source === "all" ? "/products" : "/#top-picks")
          }
        >
          <ArrowLeft size={20} />
          Back
        </Button>

        {/* Breadcrumb / Category Path */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/products" className="hover:underline">
            All Products
          </Link>{" "}
          / <span>{category}</span> / <span>{subcategory}</span>
        </div>

        {/* Product Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            {/* <Zoom> */}
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={400}
              height={400}
              className="w-full h-full object-cover object-center rounded-lg"
            />
            {/* </Zoom> */}
          </div>

          {/* Product Details */}
          <div>
            {/* Category Badge */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {category}
              </span>
              {subcategory !== "Uncategorized" && (
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                  {subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(rating)
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                    fill={i < Math.floor(rating) ? "#FBBF24" : "none"}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">
                {rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {product.description || "No description available."}
            </p>

            {/* Amazon Button */}
            {product.amazonUrl && (
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="w-full text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90"
                >
                  View on Amazon
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Extra Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 bg-primary/90 text-white border-none">
            <h3 className="text-xl font-bold mb-4">Guidelines</h3>
            {/* {product.guidelines?.length ? (
              <ul className="space-y-2">
                {product.guidelines.map((g, idx) => (
                  <li key={idx}>
                    <strong>{g.title}: </strong> {g.points.join(", ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No guidelines available.</p>
            )} */}
          </Card>

          <Card className="p-6 bg-primary/5 border-none">
            <h3 className="text-xl font-bold mb-4">Highlights</h3>
            {/* {product.highlights?.length ? (
              <ul className="space-y-2">
                {product.highlights.map((h, idx) => (
                  <li key={idx}>• {h}</li>
                ))}
              </ul>
            ) : (
              <p>No highlights available.</p>
            )} */}
          </Card>
        </div>
      </div>
    </main>
  );
}
