import Link from "next/link";
import { ArrowRight, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CHICAGO_JACKPOT,
  CHICAGOLAND_DEALERSHIP_PROMOTION_NAME,
} from "@/lib/promotions/chicago-jackpot";

interface Props {
  slotsRemaining?: number;
}

/** Compact promotions strip for the homepage — readable on dark showroom background. */
export function HomepagePromotionsTeaser({ slotsRemaining = CHICAGO_JACKPOT.MAX_WINNERS }: Props) {
  return (
    <section className="py-14 md:py-16 border-y border-white/10 bg-white/[0.03]" aria-labelledby="home-promo-heading">
      <div className="container max-w-5xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 rounded-2xl border border-primary/25 bg-primary/[0.06] p-8 md:p-10">
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-3">
              <Gift size={14} />
              Dealer offers · live now
            </p>
            <h2 id="home-promo-heading" className="font-display text-2xl md:text-3xl font-light text-white leading-tight">
              {CHICAGOLAND_DEALERSHIP_PROMOTION_NAME}
            </h2>
            <p className="text-white/60 mt-3 text-sm md:text-base leading-relaxed max-w-xl">
              Chicagoland dealers: claim your profile, collect{" "}
              <strong className="text-white/90">{CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified reviews</strong>, and
              the first {CHICAGO_JACKPOT.MAX_WINNERS} qualified rooftops earn{" "}
              <strong className="text-white/90">{CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years of Enterprise access</strong>.
              Plus billing bonuses on every paid plan.
            </p>
            <p className="text-primary/90 text-sm mt-3 font-medium tabular-nums">
              <Trophy size={14} className="inline mr-1.5 -mt-0.5" />
              {slotsRemaining} promotion slots remaining
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/promotions">
              <Button size="lg" className="rounded-xl font-semibold shadow-ember w-full sm:w-auto">
                See all promotions
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/claim">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
              >
                Claim free profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
