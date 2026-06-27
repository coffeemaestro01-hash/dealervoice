import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck } from "lucide-react";

export function ForDealersHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-gradient-to-b from-primary/6 via-background to-background">
      <div className="container relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">For dealerships</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Reputation that earns trust — and tools that convert it
        </h1>
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-2xl">
          Claim your profile free. Respond to reviews. Upgrade when you&apos;re ready — plus{" "}
          <Link href="/promotions" className="text-primary font-medium hover:underline">
            live promotions
          </Link>{" "}
          including the Chicagoland Dealership Promotion and billing-period bonuses.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/claim">
            <Button size="lg" className="gap-2 font-semibold">
              <BadgeCheck size={18} />
              Claim free profile
            </Button>
          </Link>
          <Link href="/promotions">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              See promotions <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              View Pro plans <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
