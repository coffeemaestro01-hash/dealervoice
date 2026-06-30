import type { Metadata } from "next";
import { ForDealersHero } from "@/components/home/ForDealersHero";
import { DealerPlatformStack } from "@/components/marketing/DealerPlatformStack";
import { DealerValueLadder } from "@/components/marketing/DealerValueLadder";
import { DealerStackValueComparison } from "@/components/marketing/DealerStackValueComparison";
import { DealerPromotionsShowcase } from "@/components/promotions/DealerPromotionsShowcase";
import { ForDealersFinalCta } from "@/components/marketing/ForDealersFinalCta";
import { getChicagoJackpotAdminSummary } from "@/lib/promotions/chicago-jackpot";

export const metadata: Metadata = {
  title: "Dealer Solutions — Reputation, AI & Inbox | DealerVoice",
  description:
    "One platform for dealership reputation, 24/7 AI lead capture, and customer support inbox. Free to claim. Pro from $199/mo with AI and Inbox included.",
};

export const dynamic = "force-dynamic";

export default async function ForDealersPage() {
  let promoStats = { jackpotSlotsRemaining: 100, jackpotWinners: 0 };
  try {
    const jackpot = await getChicagoJackpotAdminSummary();
    promoStats = {
      jackpotSlotsRemaining: jackpot.slotsRemaining,
      jackpotWinners: jackpot.winnerTotal,
    };
  } catch {
    /* defaults */
  }

  return (
    <>
      <ForDealersHero />
      <DealerPlatformStack />
      <DealerValueLadder />
      <DealerStackValueComparison />
      <DealerPromotionsShowcase stats={promoStats} bonusTone />
      <ForDealersFinalCta />
    </>
  );
}
