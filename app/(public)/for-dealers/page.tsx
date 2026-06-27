import type { Metadata } from "next";
import { ForDealersHero } from "@/components/home/ForDealersHero";
import { DealerReputationSection } from "@/components/home/DealerReputationSection";
import { DealerGrowthBanner } from "@/components/home/DealerGrowthBanner";
import { DealerAISalesAssistantSection } from "@/components/home/DealerAISalesAssistantSection";
import { DealerPromotionsShowcase } from "@/components/promotions/DealerPromotionsShowcase";
import { getChicagoJackpotAdminSummary } from "@/lib/promotions/chicago-jackpot";

export const metadata: Metadata = {
  title: "Dealer Solutions — Reputation & AI Tools | DealerVoice",
  description:
    "Claim your dealership profile, manage reviews, capture leads with AI, and grow visibility. Chicagoland Dealership Promotion + billing bonuses live now.",
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
      <DealerPromotionsShowcase stats={promoStats} />
      <DealerReputationSection />
      <DealerGrowthBanner />
      <DealerAISalesAssistantSection />
    </>
  );
}
