import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Tech Enthusiast",
    content:
      "Found amazing products here that I wouldn't have discovered otherwise. Great quality recommendations!",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Professional",
    content:
      "The curated selection saves me so much time. Every product I've purchased has been exactly as described.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Freelancer",
    content:
      "Exceptional recommendations with honest reviews. This is my go-to source for product shopping.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="reviews"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background dark:bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Loved by <span className="text-primary">Real Customers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 animate-fade-in-up">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 sm:p-8 bg-muted/50 dark:bg-muted/20 border border-border dark:border-border/50 hover:bg-muted/70 dark:hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < testimonial.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-foreground mb-4 leading-relaxed">
                {testimonial.content}
              </p>
              <div>
                <p className="font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
