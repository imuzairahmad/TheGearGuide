"use client";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MappedProduct } from "@/lib/modules";

interface ProductCardProps {
  product: MappedProduct;
  source: "top" | "all";
}

export default function ProductCard({ product, source }: ProductCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/products/${product.slug}?source=${source}`)}
      className="group overflow-hidden hover:shadow-lg transition-shadow duration-300   border border-border dark:border-border/50 flex flex-col h-full cursor-pointer"
    >
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
          <Link
            href={product.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({ variant: "default" })} w-full mb-6 text-white`}
          >
            Check Price at Amazon
          </Link>
        </div>
      </div>
    </Card>
  );
}
