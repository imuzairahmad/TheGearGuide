"use client";

export default function BoldSection() {
  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-20 text-center lg:text-left animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-widest">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            Premium Products,
            <span className="block text-primary">Exceptional Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mt-6">
            Discover why thousands of customers trust us for their everyday
            essentials
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Curated Selection",
              description:
                "Handpicked premium products for discerning customers",
            },
            {
              title: "Timeless Quality",
              description:
                "Products built to last with exceptional craftsmanship",
            },
            {
              title: "Expert Curation",
              description:
                "Each item selected for its design and functionality",
            },
            {
              title: "Fast Delivery",
              description: "Quick and reliable shipping to your doorstep",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group animate-fade-in-up p-6 rounded-lg border border-border/50 hover:border-primary/50 bg-card/30 hover:bg-card/60 transition-all duration-300 backdrop-blur-sm"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="h-1 w-10 bg-primary rounded-full mb-4 group-hover:w-14 transition-all duration-300"></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
