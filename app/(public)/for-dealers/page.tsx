import type { Metadata } from "next";
import { ForDealersHero } from "@/components/home/ForDealersHero";
import { DealerReputationSection } from "@/components/home/DealerReputationSection";
import { DealerGrowthBanner } from "@/components/home/DealerGrowthBanner";
import { DealerAISalesAssistantSection } from "@/components/home/DealerAISalesAssistantSection";

export const metadata: Metadata = {
  title: "Dealer Solutions — Reputation & AI Tools | DealerVoice",
  description:
    "Claim your dealership profile, manage reviews, capture leads with AI, and grow visibility with Pro and Pro+ plans.",
};

export default async function ForDealersPage() {
  return (
    <>
      <ForDealersHero />
      <DealerReputationSection />
      <DealerGrowthBanner />
      <DealerAISalesAssistantSection />
    </>
  );
}
