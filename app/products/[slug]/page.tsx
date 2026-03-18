"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  LoaderCircle,
  XCircle,
  CheckCircle,
  ChevronDown,
  ShieldQuestionMark,
  UserCheck,
  UserX,
} from "lucide-react";

import ScoreBar from "@/components/ui/scorebar";
import Description from "@/components/ui/description";
import { ProductFAQ } from "@/components/ui/faqs";
import { MappedProduct } from "@/lib/modules";

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const source = searchParams.get("source") || "all";

  const [product, setProduct] = useState<MappedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product
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

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );
  }

  // const rating = product.rating || 0;
  // const reviewsCount = product.reviewsCount || 0;
  const category = product.category || "Uncategorized";
  const subcategory = product.subcategory || "Uncategorized";

  // ✅ OVERALL SCORE CALCULATION
  const overallScore = product.scores?.length
    ? (
        product.scores.reduce((sum, s) => sum + s.score, 0) /
        product.scores.length
      ).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2"
          onClick={() =>
            router.push(source === "all" ? "/products" : "/#top-picks")
          }
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/products" className="hover:underline">
            Products
          </Link>{" "}
          / <span>{category}</span> / <span>{subcategory}</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              width={400}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {category}
              </span>
              {subcategory !== "Uncategorized" && (
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                  {subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            {/* Rating */}
            {/* <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(rating)
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }
                    fill={i < Math.floor(rating) ? "#FBBF24" : "none"}
                  />
                ))}
              </div>
              <span className="font-semibold">{rating}</span>
              <span className="text-muted-foreground">({reviewsCount})</span>
            </div> */}

            {/* Amazon */}
            {product.amazonUrl && (
              <Link
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonVariants({ variant: "default" })} w-full mb-6 text-white`}
              >
                Check Price at Amazon
              </Link>
            )}

            {/* Description */}
            <Card className="p-6 bg-primary/5 border-none overflow-hidden">
              <h3 className="text-xl font-bold">Description</h3>
              <Description text={product.description} />
            </Card>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pros */}
          <Card className="p-6 bg-primary/90 text-white border-none">
            <h3 className="text-xl font-bold mb-2">Pros</h3>
            {product.pros ? (
              <ul className="space-y-3">
                {product.pros.split("\n").map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1 text-green-300" />
                    <span className="leading-relaxed">{pro}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pros available.</p>
            )}
          </Card>

          {/* Cons */}
          <Card className="p-6 bg-primary/5 border-none">
            <h3 className="text-xl font-bold mb-2">Cons</h3>
            {product.cons ? (
              <ul className="space-y-3">
                {product.cons.split("\n").map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <span className="leading-relaxed">{con}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No cons available.</p>
            )}
          </Card>

          {/* SCORES */}
          {product.scores?.length && (
            <Card className="p-6 bg-primary/5 text-white border-none">
              {/* Overall Score */}
              {overallScore && (
                <div className="flex items-center gap-6 mb-6">
                  <div className="bg-primary text-white px-4 py-3 rounded-lg text-center">
                    <div className="text-4xl font-bold">{overallScore}</div>
                    <div className="text-xs uppercase opacity-80">
                      Overall Scores
                    </div>
                  </div>
                </div>
              )}
              Individual Scores
              <div className="space-y-4">
                {product.scores.map((s, i) => (
                  <ScoreBar key={i} label={s.label} score={s.score} />
                ))}
              </div>
            </Card>
          )}

          {/* Key Points
          <Card className="p-6 bg-primary/5 border-none">
            <h3 className="text-xl font-bold">Key Points</h3>
            {product.keyPoints ? (
              <ul className="space-y-2">
                {product.keyPoints.split("\n").map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronDown className="w-5 h-5 text-green-300 flex-shrink-0 mt-1" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No key points available.</p>
            )}
          </Card> */}

          {/* Faqs */}
          <Card className="p-6 bg-primary/5 border-none">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldQuestionMark className="w-5 h-5 text-blue-500" />
              FAQs About This Product
            </h3>
            <ProductFAQ faqs={product.faqs ?? []} />
          </Card>
        </div>
      </div>
    </main>
  );
}
