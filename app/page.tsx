import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";

import { HeroSection } from "@/components/home/HeroSection";
import { HomepageAudienceSplit } from "@/components/home/HomepageAudienceSplit";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { HomepageTrustTeaser } from "@/components/home/HomepageTrustTeaser";
import { HomepageInsightsTeaser } from "@/components/home/HomepageInsightsTeaser";
import { HomepageCtaSection } from "@/components/home/HomepageCtaSection";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice — Trusted Car Dealership Reviews Worldwide",
  description:
    "Find car dealerships worldwide. Read verified buyer reviews, browse dealer inventory, and compare reputation scores before you buy or service your vehicle.",
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
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection stats={stats} />
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
