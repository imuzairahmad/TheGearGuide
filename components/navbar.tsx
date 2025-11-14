"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ToggleTheme } from "./toggle-theme";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() =>
              document
                .getElementById("home")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                G
              </span>
            </div>
            <span className="hidden font-bold text-foreground sm:inline-block">
              TheGear<span className="text-primary">Guide</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Button
              variant={"ghost"}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Products
            </Button>
            <Button
              variant={"ghost"}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              onClick={() =>
                document
                  .getElementById("reviews")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Reviews
            </Button>
          </div>

          {/* Right side - Theme toggle + Mobile menu button */}
          <div className="flex items-center gap-4">
            <span className="mb-2">
              <ToggleTheme />
            </span>
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-border/40 pb-4 md:hidden">
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant={"ghost"}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Products
              </Button>
              <Button
                variant={"ghost"}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                onClick={() =>
                  document
                    .getElementById("reviews")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Reviews
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
