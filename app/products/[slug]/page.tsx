"use client";

import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, LoaderCircle } from "lucide-react";
import Zoom from "react-medium-image-zoom";
// import "react-medium-image-zoom/dist/styles.css";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { MappedProduct } from "@/lib/contentful";
import { Card } from "@/components/ui/card";

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;

  // source = "top" or "all" to determine where we came from
  const source = searchParams.get("source") || "all";

  const [product, setProduct] = useState<MappedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto flex justify-center">
          <LoaderCircle className="animate-spin w-10 h-10 text-muted-foreground" />
        </div>
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

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 flex items-center gap-2"
          onClick={() => {
            router.push(source === "all" ? "/products" : "/#top-picks");
          }}
        >
          <ArrowLeft size={20} />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            {/* <Zoom> */}
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={400}
              height={400}
              className="w-full h-full object-cover object-center "
            />
            {/* </Zoom> */}
          </div>

          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(product.rating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">
                {product.rating || 0}
              </span>
              <span className="text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 bg-primary/90 text-white border-none">
            <h3 className="text-xl font-bold mb-4">Guidelines</h3>
            <ul className="space-y-2">
              {/* {product.guidelines.map((g, idx) => (
                  <li key={idx}>
                    <strong>{g.title}: </strong> {g.points.join(", ")}
                  </li>
                ))} */}
            </ul>
          </Card>

          <Card className="p-6 bg-primary/5 border-none">
            <h3 className="text-xl font-bold mb-4">Highlights</h3>
          </Card>
        </div>
      </div>
    </main>
  );
}
