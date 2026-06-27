"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHICAGO_JACKPOT,
  jackpotStatusLabel,
} from "@/lib/promotions/chicago-jackpot";
import type { ChicagoJackpotStatus } from "@prisma/client";
import { formatBillingBonusLabel } from "@/lib/billing/period-bonus";

type JackpotEntry = {
  id: string;
  status: ChicagoJackpotStatus;
  verifiedReviewCount: number;
  reviewsThisMonth: number;
  complianceMonth: string | null;
  wonAt: string | null;
  enterpriseUntil: string | null;
  forfeitedReason: string | null;
  dealership: {
    name: string;
    slug: string;
    cityName: string | null;
    stateCode: string | null;
  };
};

type BillingRedemption = {
  id: string;
  bonusType: string;
  billingInterval: string;
  bonusDays: number;
  accessUntil: string;
  createdAt: string;
};

export function DealerPromotionsPanel() {
  const [loading, setLoading] = useState(true);
  const [jackpot, setJackpot] = useState<JackpotEntry | null>(null);
  const [eligible, setEligible] = useState(false);
  const [redemptions, setRedemptions] = useState<BillingRedemption[]>([]);

  useEffect(() => {
    fetch("/api/dealer/promotions")
      .then((r) => r.json())
      .then((json) => {
        setJackpot(json.jackpot ?? null);
        setEligible(!!json.chicagoEligible);
        setRedemptions(json.billingRedemptions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" /> Loading promotions…
      </div>
    );
  }

  const progress = jackpot
    ? Math.min(100, Math.round((jackpot.verifiedReviewCount / CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS) * 100))
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Promotions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track Chicago Jackpot progress and billing-period bonus redemptions.
        </p>
      </div>

      {eligible || jackpot ? (
        <section className="surface-panel rounded-xl p-6 border border-border/60">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Chicago Jackpot</h2>
              <p className="text-sm text-muted-foreground mt-1">
                First {CHICAGO_JACKPOT.MAX_WINNERS} Chicagoland dealerships with{" "}
                {CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified reviews on a claimed profile win{" "}
                {CHICAGO_JACKPOT.ENTERPRISE_FREE_YEARS} years of Enterprise — free.
              </p>
            </div>
          </div>

          {jackpot ? (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {jackpotStatusLabel(jackpot.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {jackpot.verifiedReviewCount} / {CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified reviews
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {jackpot.status === "WINNER" && (
                <p className="text-sm text-muted-foreground">
                  Enterprise access until{" "}
                  {jackpot.enterpriseUntil
                    ? new Date(jackpot.enterpriseUntil).toLocaleDateString()
                    : "—"}
                  . Maintain at least {CHICAGO_JACKPOT.MIN_MONTHLY_REVIEWS} verified reviews per month.
                </p>
              )}
              {jackpot.status === "WINNER" && (
                <p className="text-sm text-muted-foreground mt-2">
                  This month ({jackpot.complianceMonth ?? "—"}): {jackpot.reviewsThisMonth} verified reviews
                </p>
              )}
              {jackpot.status === "FORFEITED" && jackpot.forfeitedReason && (
                <p className="text-sm text-destructive">{jackpot.forfeitedReason}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Claim your listing and collect verified reviews to enter the Chicago Jackpot.
            </p>
          )}
        </section>
      ) : null}

      <section className="surface-panel rounded-xl p-6 border border-border/60">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Gift size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Billing-period bonuses</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Extra paid-plan access when you subscribe:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>{formatBillingBonusLabel("annual")}</li>
              <li>{formatBillingBonusLabel("semiannual")}</li>
              <li>{formatBillingBonusLabel("monthly")}</li>
            </ul>
          </div>
        </div>

        {redemptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bonus redemptions yet.</p>
        ) : (
          <ul className="space-y-2">
            {redemptions.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap justify-between gap-2 text-sm py-2 border-b border-border/40 last:border-0"
              >
                <span className="text-foreground capitalize">
                  {r.billingInterval} · +{r.bonusDays} days
                </span>
                <span className="text-muted-foreground">
                  Access until {new Date(r.accessUntil).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
