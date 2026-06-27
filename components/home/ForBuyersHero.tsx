import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PenLine, Search } from "lucide-react";

export function ForBuyersHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-gradient-to-b from-background via-pearl/30 to-background">
      <div className="container relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">For car buyers</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Know the dealer before you visit the lot
        </h1>
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-2xl">
          Search dealerships, read verified buyer reviews, and compare trust scores — so your next purchase starts with
          clarity, not guesswork.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/dealers">
            <Button size="lg" className="gap-2 font-semibold">
              <Search size={18} />
              Find dealerships
            </Button>
          </Link>
          <Link href="/write-review">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              <PenLine size={18} />
              Write a review
            </Button>
          </Link>
          <Link href="/chicago" className="text-sm text-primary hover:underline self-center px-2">
            Chicago dealers →
          </Link>
        </div>
      </div>
    </section>
  );
}
