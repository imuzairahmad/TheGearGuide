import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const WORDS = ["Questions?", "Ideas?", "Collaborations?"];

export default function RotatingMicroStatement() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setVisible(true);
      }, 300);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 space-y-2">
      <span
        className={cn(
          "inline-block text-lg font-medium text-foreground transition-all duration-300",
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        )}
      >
        {WORDS[index]}
      </span>

      <div className="text-sm text-muted-foreground">→ Let’s talk.</div>
    </div>
  );
}
