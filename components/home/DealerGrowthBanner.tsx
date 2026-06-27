import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Trophy, BadgeCheck, ArrowRight } from "lucide-react";
import { CHICAGO_JACKPOT, CHICAGOLAND_DEALERSHIP_PROMOTION_NAME } from "@/lib/promotions/chicago-jackpot";

export function DealerGrowthBanner() {
  return (
    <section className="border-y border-primary/20 bg-gradient-to-r from-primary/8 via-background to-primary/8">
      <div className="container py-10 flex flex-col lg:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4 max-w-2xl">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/15 text-primary shrink-0">
            <TrendingUp size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
              <Trophy size={12} />
              {CHICAGOLAND_DEALERSHIP_PROMOTION_NAME}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified reviews → {CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years Enterprise
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              First {CHICAGO_JACKPOT.MAX_WINNERS} qualified Chicagoland rooftops win Enterprise access. Plus Pro from $199/mo with{" "}
              <strong className="text-foreground">AI Sales Assistant</strong>, billing bonuses, and service-area coverage.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/promotions">
            <Button className="gap-2 font-semibold">
              See promotions <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/claim">
            <Button variant="outline" className="gap-2 border-primary/30">
              <BadgeCheck size={16} /> Claim free
            </Button>
          </Link>
          <Link href="/chicago">
            <Button variant="ghost" className="text-primary">
              Chicago hub →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
