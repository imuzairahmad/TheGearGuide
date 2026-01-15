import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import { LoaderCircle } from "lucide-react";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex justify-center items-center">
          <LoaderCircle className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
