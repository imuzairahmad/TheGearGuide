import { Card } from "@/components/ui/card";
import { CheckCircle, Award, TrendingUp } from "lucide-react";

const trustElements = [
  {
    icon: CheckCircle,
    title: "Verified Reviews",
    description: "All products rated by real customers with verified purchases",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Only top-rated products with consistent 4.5+ star ratings",
  },
  {
    icon: TrendingUp,
    title: "Best Value",
    description:
      "Curated for performance, durability, and price-to-value ratio",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Why Trust Our <span className="text-primary">Recommendations?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-fade-in-up">
          {trustElements.map((element, index) => {
            const Icon = element.icon;
            return (
              <Card
                key={index}
                className="p-6 sm:p-8 text-center bg-background dark:bg-background border border-border dark:border-border/50 hover:border-primary/50 transition-colors"
              >
                <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {element.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {element.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
