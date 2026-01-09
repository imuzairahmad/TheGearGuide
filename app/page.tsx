import ContactForm from "@/components/contactform";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import ProductGrid from "@/components/product-grid";

export default async function Home() {
  return (
    <>
      <Hero />
      <div id="top-picks">
        <ProductGrid />
      </div>
      <ContactForm />
      <Footer />
    </>
  );
}
