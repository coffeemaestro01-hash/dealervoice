import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";

import { HomepageCinematicHero } from "@/components/home/HomepageCinematicHero";
import { HomepagePlatformShowcase } from "@/components/home/HomepagePlatformShowcase";
import { HomepageAudienceSplit } from "@/components/home/HomepageAudienceSplit";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { HomepageTrustTeaser } from "@/components/home/HomepageTrustTeaser";
import { HomepageInsightsTeaser } from "@/components/home/HomepageInsightsTeaser";
import { HomepageCtaSection } from "@/components/home/HomepageCtaSection";
import { HomepagePromotionsTeaser } from "@/components/home/HomepagePromotionsTeaser";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { getChicagoJackpotAdminSummary } from "@/lib/promotions/chicago-jackpot";

export const metadata: Metadata = {
  title: "DealerVoice — The AI Dealership Reputation Platform",
  description:
    "Verified reviews, transparent trust scores, and AI that helps dealerships capture every lead. The reputation platform built for automotive retail.",
};

export const dynamic = "force-dynamic";

async function getHeroStats() {
  try {
    const [dealers, countries, reviews] = await Promise.all([
      prisma.dealership.count({ where: { deletedAt: null } }),
      prisma.country.count({ where: { dealerCount: { gt: 0 } } }),
      prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    ]);
    return { dealers, countries, reviews };
  } catch {
    return { dealers: 0, countries: 0, reviews: 0 };
  }
}

export default async function HomePage() {
  const stats = await getHeroStats();
  let slotsRemaining = 100;
  try {
    const jackpot = await getChicagoJackpotAdminSummary();
    slotsRemaining = jackpot.slotsRemaining;
  } catch {
    /* default */
  }

  return (
    <div className="flex flex-col min-h-screen bg-showroom">
      <div className="relative">
        <Navbar overHero />
        <HomepageCinematicHero stats={stats} />
      </div>
      <main className="flex-1">
        <HomepagePlatformShowcase />
        <HomepagePromotionsTeaser slotsRemaining={slotsRemaining} />
        <HomepageAudienceSplit />
        <Suspense>
          <RecentReviewsSection showExploreLink />
        </Suspense>
        <HomepageTrustTeaser />
        <Suspense>
          <HomepageInsightsTeaser />
        </Suspense>
        <HomepageCtaSection />
      </main>
      <Footer />
    </div>
  );
}
