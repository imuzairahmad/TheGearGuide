import { useState } from "react";

export default function Description({ text }: { text?: string }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 300; // max characters before truncating

  if (!text)
    return <p className="text-muted-foreground">No description available.</p>;

  const isLong = text.length > maxLength;
  const displayedText = expanded
    ? text
    : text.slice(0, maxLength) + (isLong ? "..." : "");

  return (
    <div>
      <p className="text-sm text-muted-foreground whitespace-pre-line break-words">
        {displayedText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-primary font-medium underline text-sm"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
