import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href="/"
      onClick={() =>
        document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })
      }
      className="flex items-center gap-2"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground">G</span>
      </div>
      <span className="hidden font-bold text-foreground sm:inline-block">
        TheGear<span className="text-primary">Guide</span>
      </span>
    </Link>
  );
};

export default Logo;
