"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHICAGO_JACKPOT,
  CHICAGOLAND_DEALERSHIP_PROMOTION_NAME,
  jackpotStatusLabel,
} from "@/lib/promotions/chicago-jackpot";
import type { ChicagoJackpotStatus } from "@prisma/client";
import Link from "next/link";

type Entry = {
  id: string;
  status: ChicagoJackpotStatus;
  verifiedReviewCount: number;
  reviewsThisMonth: number;
  complianceMonth: string | null;
  wonAt: string | null;
  enterpriseUntil: string | null;
  forfeitedReason: string | null;
  dealership: {
    id: string;
    name: string;
    slug: string;
    cityName: string | null;
    stateCode: string | null;
    status: string;
  };
};

type BillingRow = {
  id: string;
  bonusType: string;
  billingInterval: string;
  bonusDays: number;
  accessUntil: string;
  createdAt: string;
  dealership: { id: string; name: string; slug: string };
};

export function AdminCampaignPromotionsPanel() {
  const [loading, setLoading] = useState(true);
  const [jackpotEntries, setJackpotEntries] = useState<Entry[]>([]);
  const [slotsRemaining, setSlotsRemaining] = useState(0);
  const [winnerTotal, setWinnerTotal] = useState(0);
  const [billingRedemptions, setBillingRedemptions] = useState<BillingRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/campaign-promotions")
      .then((r) => r.json())
      .then((json) => {
        setJackpotEntries(json.jackpot?.entries ?? []);
        setSlotsRemaining(json.jackpot?.slotsRemaining ?? 0);
        setWinnerTotal(json.jackpot?.winnerTotal ?? 0);
        setBillingRedemptions(json.billingRedemptions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 size={18} className="animate-spin" /> Loading campaign promotions…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-foreground mb-1">{CHICAGOLAND_DEALERSHIP_PROMOTION_NAME}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {winnerTotal} / {CHICAGO_JACKPOT.MAX_WINNERS} winner slots filled · {slotsRemaining} remaining ·{" "}
          {CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS} verified reviews required ·{" "}
          {CHICAGO_JACKPOT.MIN_MONTHLY_REVIEWS}/mo compliance after winning
        </p>

        {jackpotEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No Chicagoland entries yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                  <th className="p-3 font-medium">Dealership</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Verified</th>
                  <th className="p-3 font-medium">This month</th>
                  <th className="p-3 font-medium">Won / until</th>
                </tr>
              </thead>
              <tbody>
                {jackpotEntries.map((e) => (
                  <tr key={e.id} className="border-b border-border/40 last:border-0">
                    <td className="p-3">
                      <Link
                        href={`/dealers/us/${e.dealership.slug}`}
                        className="text-foreground hover:text-primary font-medium"
                      >
                        {e.dealership.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {[e.dealership.cityName, e.dealership.stateCode].filter(Boolean).join(", ")}
                      </p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {jackpotStatusLabel(e.status)}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground">
                      {e.verifiedReviewCount}/{CHICAGO_JACKPOT.TARGET_VERIFIED_REVIEWS}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {e.reviewsThisMonth} ({e.complianceMonth ?? "—"})
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {e.wonAt ? new Date(e.wonAt).toLocaleDateString() : "—"}
                      {e.enterpriseUntil ? ` → ${new Date(e.enterpriseUntil).toLocaleDateString()}` : ""}
                      {e.forfeitedReason ? (
                        <span className="block text-destructive">{e.forfeitedReason}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-foreground mb-1">Billing-period bonus redemptions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Annual (2yr), 6-month (1yr), and monthly (45-day) bonus grants per dealership.
        </p>
        {billingRedemptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No redemptions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                  <th className="p-3 font-medium">Dealership</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Bonus days</th>
                  <th className="p-3 font-medium">Access until</th>
                  <th className="p-3 font-medium">Redeemed</th>
                </tr>
              </thead>
              <tbody>
                {billingRedemptions.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="p-3 text-foreground">{r.dealership.name}</td>
                    <td className="p-3 capitalize text-muted-foreground">
                      {r.billingInterval} ({r.bonusType.toLowerCase()})
                    </td>
                    <td className="p-3 text-foreground">+{r.bonusDays}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(r.accessUntil).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
