"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MappedProduct } from "@/lib/contentfull";

interface ProductCardProps {
  product: MappedProduct;
  source: "top" | "all";
}

export default function ProductCard({ product, source }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}?source=${source}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300   border border-border dark:border-border/50 flex flex-col h-full">
        <div className="aspect-square overflow-hidden bg-muted  cursor-pointer">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            width={300}
            height={300}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex flex-col flex-grow">
          <div>
            <p className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </div>

          <div className="mt-auto">
            <Button
              asChild
              className="w-full text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90"
              size="sm"
            >
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Check Price at Amazon
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
