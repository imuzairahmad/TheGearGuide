import ComplementPage from "@/components/complement-page";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";
import TestimonialsSection from "@/components/testimonials-section";
import TrustSection from "@/components/trust-section";

export default function Home() {
  return (
    <>
      <Hero />
      <div id="products">
        <ProductGrid />
      </div>
      <TrustSection />
      {/* <TestimonialsSection /> */}
      <ComplementPage />
    </>
  );
}
