import Link from "next/link";
import { ArrowRight, Calendar, Gift, Sparkles, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHICAGO_JACKPOT, CHICAGOLAND_DEALERSHIP_PROMOTION_NAME } from "@/lib/promotions/chicago-jackpot";
import { formatBillingBonusLabel } from "@/lib/billing/period-bonus";

export interface PromotionsShowcaseStats {
  jackpotSlotsRemaining: number;
  jackpotWinners: number;
}

const BILLING_PROMOS = [
  {
    interval: "annual" as const,
    headline: "Pay annually",
    reward: "2 years of paid features",
    limit: "Once per dealership",
    icon: Calendar,
  },
  {
    interval: "semiannual" as const,
    headline: "Pay every 6 months",
    reward: "1 year of paid features",
    limit: "Once per dealership",
    icon: Zap,
  },
  {
    interval: "monthly" as const,
    headline: "Pay monthly",
    reward: "45 days of paid features",
    limit: "Up to 3 redemptions per dealership",
    icon: Gift,
  },
];

interface Props {
  stats?: PromotionsShowcaseStats;
  compact?: boolean;
  /** Reframe as a closing bonus block (e.g. on /for-dealers). */
  bonusTone?: boolean;
}

export function DealerPromotionsShowcase({ stats, compact = false, bonusTone = false }: Props) {
  const slotsLeft = stats?.jackpotSlotsRemaining ?? CHICAGO_JACKPOT.MAX_WINNERS;
  const winners = stats?.jackpotWinners ?? 0;

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      aria-labelledby="dealer-promotions-heading"
    >
      <div className="absolute inset-0 bg-showroom" aria-hidden />
      <div className="absolute inset-0 bg-circuit opacity-[0.05]" aria-hidden />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            <Sparkles size={14} />
            {bonusTone ? "Stack bonuses on top" : "Limited-time dealer offers"}
          </p>
          <h2 id="dealer-promotions-heading" className="font-display text-3xl md:text-4xl font-light text-white leading-tight">
            {bonusTone ? (
              <>
                Already strong value —
                <span className="text-gradient-gold"> we reward commitment too</span>
              </>
            ) : (
              <>
                Promotions that reward
                <span className="text-gradient-gold"> growth and commitment</span>
              </>
            )}
          </h2>
          {!compact && (
            <p className="text-white/50 mt-4 text-base leading-relaxed">
              {bonusTone
                ? "Billing-period bonuses apply automatically at checkout. Chicagoland dealers can compete for Enterprise access on top of an already complete platform."
                : "Active on every paid plan checkout. Track your progress anytime in the dealer dashboard after you claim."}
            </p>
          )}
        </div>

        {/* Chicagoland Dealership Promotion — hero promo */}
        <div className="glass-panel glow-ring rounded-2xl p-8 md:p-10 mb-8 border border-primary/25">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4">
                <Trophy size={12} />
                {CHICAGOLAND_DEALERSHIP_PROMOTION_NAME}
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-light text-white">
                {CHICAGO_JACKPOT.MAX_WINNERS} Chicagoland dealers.{" "}
                <span className="text-gradient-gold">{CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years Enterprise access.</span>
              </h3>
              <p className="text-white/55 mt-3 text-sm md:text-base leading-relaxed max-w-xl">
                Claim your listing and collect{" "}
                <strong className="text-white/80">{CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified buyer reviews</strong>{" "}
                from real customers. First {CHICAGO_JACKPOT.MAX_WINNERS} qualified dealerships win{" "}
                {CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years of Enterprise access — then keep{" "}
                <strong className="text-white/80">{CHICAGO_JACKPOT.MIN_MONTHLY_REVIEWS}+ verified reviews per month</strong>{" "}
                to stay eligible.
              </p>
              <div className="flex flex-wrap gap-4 mt-5 text-sm">
                <span className="text-white/40">
                  <strong className="text-primary tabular-nums">{slotsLeft}</strong> slots left
                </span>
                <span className="text-white/40">
                  <strong className="text-white/70 tabular-nums">{winners}</strong> winners so far
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link href="/claim">
                <Button size="lg" className="w-full sm:w-auto rounded-xl shadow-ember font-semibold">
                  Claim &amp; enter
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/chicago">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Chicago dealers →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Billing-period bonuses */}
        <div>
          <h3 className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-white/45 mb-6">
            Billing-period bonuses — automatic on checkout
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {BILLING_PROMOS.map((promo) => (
              <article
                key={promo.interval}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-primary/30 transition-colors"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                  <promo.icon size={20} strokeWidth={1.5} />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">{promo.headline}</p>
                <p className="font-display text-xl text-white mt-2">{promo.reward}</p>
                <p className="text-xs text-white/45 mt-2">{promo.limit}</p>
                <p className="text-[11px] text-white/30 mt-3 leading-relaxed">
                  {formatBillingBonusLabel(promo.interval)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/pricing">
            <Button size="lg" className="rounded-xl font-semibold shadow-ember">
              View plans &amp; pricing
            </Button>
          </Link>
          <Link href="/dashboard/dealer/promotions">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Track progress (dealers)
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
