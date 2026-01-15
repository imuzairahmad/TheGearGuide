import { BackgroundBeams } from "./ui/background-beams";

const footerData = [
  {
    title: "🏆 Shop Now on Amazon",
    description:
      "✔️ Click on your favorite items and enjoy hassle-free shopping. As a participant in the Amazon Associates Program, we earn from qualifying purchases.",
  },
  {
    title: "🔥 Top Categories & Finds",
    links: [
      {
        name: "➜ Tech & Gadgets ",
        description: "– Latest electronics and accessories",
      },
      {
        name: "➜ Home & Kitchen ",
        description: "– Smart solutions for everyday living",
      },
      {
        name: "➜ Fashion & Beauty ",
        description: "– Stylish picks for every season",
      },
      {
        name: "➜ Fitness & Wellness ",
        description: "– Gear to keep you active and healthy",
      },
    ],
  },
  {
    title: "🧠 Why Shop With Us",
    links: [
      {
        name: "● Handpicked Products ",
        description: "– Top reviews and quality selection",
      },
      {
        name: "● Exclusive Deals ",
        description: "– Special discounts and offers",
      },
      {
        name: "● Fast Checkout ",
        description: "– Easy and secure Amazon checkout",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="
        relative overflow-hidden
       bg-background text-foreground border-t border-black/10 dark:border-white/10
      "
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-14">
        <div className="grid gap-10 md:grid-cols-3">
          {footerData.map((column, index) => (
            <div key={index}>
              <h3 className="mb-4 text-lg font-semibold">{column.title}</h3>
              {column.description && (
                <p className="text-sm opacity-80 space-y-1">
                  {column.description}
                </p>
              )}
              {column.links && (
                <ul className="space-y-3 text-sm">
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{link.name}</span>
                      <span className="opacity-70">{link.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} TheGearGuide. All rights reserved.
        </div>
      </div>

      {/* Background Effect */}
      <BackgroundBeams className="opacity-40 dark:opacity-30" />
    </footer>
  );
}
