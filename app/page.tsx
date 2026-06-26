import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

import { DealerGrowthBanner } from "@/components/home/DealerGrowthBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { BuyerJourneyStrip } from "@/components/home/BuyerJourneyStrip";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TrustSection } from "@/components/home/TrustSection";
import { AIAuthoritySection } from "@/components/home/AIAuthoritySection";
import { GlobalCoverageSection } from "@/components/home/GlobalCoverageSection";
import { ChicagoCoverageSection } from "@/components/home/ChicagoCoverageSection";
import { TrendingLocalDealers } from "@/components/home/TrendingLocalDealers";
import { FirstReviewerSection } from "@/components/home/FirstReviewerSection";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BlogStripSection } from "@/components/home/BlogStripSection";
import { ResearchStripSection } from "@/components/home/ResearchStripSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { HomepageAds } from "@/components/home/HomepageAds";
import { CtaSection } from "@/components/home/CtaSection";
import { DreamCarAssistant } from "@/components/trust/DreamCarAssistant";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice — Trusted Car Dealership Reviews Worldwide",
  description:
    "Find car dealerships worldwide. Read verified buyer reviews, browse dealer inventory, and compare reputation scores before you buy or service your vehicle.",
};

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
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Primary buyer funnel — above the fold */}
        <HeroSection stats={stats} />
        <DealerGrowthBanner />
        <BuyerJourneyStrip />
        <HowItWorksSection dealerCount={stats.dealers} />
        <TrustSection />
        <AIAuthoritySection />

        {/* Discovery & social proof */}
        <Suspense>
          <GlobalCoverageSection />
        </Suspense>
        <Suspense>
          <ChicagoCoverageSection />
        </Suspense>
        <Suspense>
          <TrendingLocalDealers />
        </Suspense>
        <Suspense>
          <FirstReviewerSection />
        </Suspense>
        <Suspense>
          <RecentReviewsSection />
        </Suspense>
        <Suspense>
          <TestimonialsSection />
        </Suspense>

        {/* Content & categories */}
        <Suspense>
          <BlogStripSection />
        </Suspense>
        <Suspense>
          <ResearchStripSection />
        </Suspense>
        <CategoriesSection />
        <BrandsSection />
        <Suspense>
          <HomepageAds />
        </Suspense>
        <CtaSection />
      </main>
      <Footer />

      {/* Dream Car Assistant — floats above support chat */}
      <DreamCarAssistant />
    </div>
  );
}
