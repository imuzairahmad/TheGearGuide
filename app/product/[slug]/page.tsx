"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ArrowLeft, Check, X, LoaderCircle } from "lucide-react";
import Zoom from "react-medium-image-zoom";
// @ts-ignore: Ignore import error for CSS
import "react-medium-image-zoom/dist/styles.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { MappedProduct } from "@/lib/contentful";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<MappedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
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

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/#products">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2" size={20} />
              Back to Products
            </Button>
          </Link>
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/#products">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2" size={20} />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            <Zoom>
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                width={400}
                height={400}
                className="object-cover rounded-lg"
                priority
              />
            </Zoom>
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
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">
                {product.rating}
              </span>
              <span className="text-muted-foreground">
                ({product.reviewsCount})
              </span>
            </div>

            <div className="mb-6">
              <p className="text-2xl font-semibold text-primary mb-4">
                {product.price}$
              </p>
              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>
            </div>

            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                View on Amazon
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <Check
                    size={16}
                    className="text-primary mt-1 flex-shrink-0"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Specifications
            </h3>
            <dl className="space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{key}:</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">
              Pros
            </h3>
            <ul className="space-y-2">
              {product.pros.map((pro, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <Check
                    size={16}
                    className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0"
                  />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Cons
            </h3>
            <ul className="space-y-2">
              {product.cons.map((con, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <X
                    size={16}
                    className="text-red-600 dark:text-red-400 mt-1 flex-shrink-0"
                  />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}
