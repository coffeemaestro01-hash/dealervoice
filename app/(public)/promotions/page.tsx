import type { Metadata } from "next";
import Link from "next/link";
import { DealerPromotionsShowcase } from "@/components/promotions/DealerPromotionsShowcase";
import { getChicagoJackpotAdminSummary } from "@/lib/promotions/chicago-jackpot";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dealer Promotions — Chicago Jackpot & Billing Bonuses | DealerVoice",
  description:
    "Chicago Jackpot: 5 years Enterprise free for the first 100 qualified dealers. Plus billing bonuses — 2 years on annual, 1 year on 6-month, 45 days on monthly.",
};

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  let stats = { jackpotSlotsRemaining: 100, jackpotWinners: 0 };
  try {
    const jackpot = await getChicagoJackpotAdminSummary();
    stats = {
      jackpotSlotsRemaining: jackpot.slotsRemaining,
      jackpotWinners: jackpot.winnerTotal,
    };
  } catch {
    /* defaults */
  }

  return (
    <div className="bg-background">
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">For dealerships</p>
          <h1 className="font-display text-3xl md:text-5xl font-light text-foreground leading-tight">
            Active promotions on DealerVoice
          </h1>
          <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
            These offers are live today. Claim your profile, upgrade when ready, and track every promotion from your
            dealer dashboard.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/claim">
              <Button size="lg" className="rounded-xl font-semibold">Claim free profile</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-xl">See pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      <DealerPromotionsShowcase stats={stats} />

      <section className="py-14 border-t border-border">
        <div className="container max-w-2xl text-center text-sm text-muted-foreground leading-relaxed">
          <p>
            Promotions apply to claimed dealership profiles only. Chicago Jackpot is limited to Chicagoland claimed
            listings. Billing bonuses apply automatically when you pay through Stripe — redemption limits are enforced
            per dealership. Terms may be updated; eligibility is shown in your{" "}
            <Link href="/dashboard/dealer/promotions" className="text-primary hover:underline">
              Promotions dashboard
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
