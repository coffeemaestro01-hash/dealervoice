import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { PLAN_PRICES_USD } from "@/lib/payment";

export function ForDealersHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-gradient-to-b from-primary/6 via-background to-background">
      <div className="container relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">For dealerships</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
          Everything your rooftop needs to earn trust, capture leads, and keep customers
        </h1>
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-2xl">
          One platform — reputation, AI sales chat, and a full support inbox. Free to claim.
          Pro from {PLAN_PRICES_USD.PRO.monthlyDisplay}/mo includes AI Assistant and DealerVoice Inbox.
          No separate helpdesk bill.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/claim">
            <Button size="lg" className="gap-2 font-semibold">
              <BadgeCheck size={18} />
              Claim free profile
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="gap-2 border-primary/30">
              See what&apos;s included <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
