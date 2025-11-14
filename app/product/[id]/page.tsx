"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  amazonUrl: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
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
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background dark:bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2" size={20} />
              Back to Products
            </Button>
          </Link>
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background dark:bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
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
    <main className="min-h-screen bg-background dark:bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2" size={20} />
            Back to Products
          </Button>
        </Link>

        {/* Product Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-muted dark:bg-muted rounded-lg overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-foreground">
                {product.rating}
              </span>
              <span className="text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="text-4xl font-bold text-foreground">
                {product.price}
              </div>
              <Button
                asChild
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
              >
                <a
                  href={product.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy on Amazon
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Features & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <Card className="p-6 bg-card dark:bg-card border border-border dark:border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Key Features
            </h2>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    size={20}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Specifications */}
          <Card className="p-6 bg-card dark:bg-card border border-border dark:border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Specifications
            </h2>
            <dl className="space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <dt className="text-muted-foreground font-medium">{key}:</dt>
                  <dd className="text-foreground font-semibold text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Pros */}
          <Card className="p-6 bg-card dark:bg-card border border-border dark:border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Check size={24} className="text-primary" />
              Pros
            </h2>
            <ul className="space-y-3">
              {product.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="text-primary flex-shrink-0 mt-1"
                  />
                  <span className="text-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Cons */}
          <Card className="p-6 bg-card dark:bg-card border border-border dark:border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <X size={24} className="text-red-500" />
              Cons
            </h2>
            <ul className="space-y-3">
              {product.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X size={16} className="text-red-500 flex-shrink-0 mt-1" />
                  <span className="text-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Ready to get this product?
            </h2>
            <p className="text-muted-foreground">
              Click below to view this product on Amazon with our affiliate link
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
          >
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Amazon
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
