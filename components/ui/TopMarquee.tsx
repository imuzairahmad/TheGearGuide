import { cn } from "@/lib/utils";

export default function TopMarquee() {
  return (
    <div className="relative w-full overflow-hidden border-b bg-background">
      <div className="marquee flex w-max items-center gap-12 py-2 text-sm text-muted-foreground">
        <span>
          We independently review everything we recommend. When you buy through
          our links, we may earn a commission.
        </span>
        <span aria-hidden="true">
          We independently review everything we recommend. When you buy through
          our links, we may earn a commission.
        </span>
      </div>
    </div>
  );
}
