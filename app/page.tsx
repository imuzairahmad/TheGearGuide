import ComplementPage from "@/components/complement-page";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ProductGrid from "@/components/product-grid";
import TestimonialsSection from "@/components/testimonials-section";
import TrustSection from "@/components/trust-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProductGrid />
      <TrustSection />
      <TestimonialsSection />
      <ComplementPage />
    </>
  );
}
