import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { TrendingLocalDealers } from "@/components/home/TrendingLocalDealers";
import { AutomotiveAdBanner } from "@/components/ads/AutomotiveAdBanner";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { FirstReviewerSection } from "@/components/home/FirstReviewerSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice — Find Trusted Car Dealership Reviews Worldwide",
  description:
    "Search car dealerships worldwide, read verified buyer reviews, and compare reputation scores before you buy or service your vehicle.",
};

async function getHeroStats() {
  try {
    const dealers = await prisma.dealership.count({ where: { deletedAt: null } });
    const countries = await prisma.country.count({ where: { dealerCount: { gt: 0 } } });
    const reviews = await prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } });
    return { dealers, countries, reviews };
  } catch {
    return { dealers: 0, countries: 0, reviews: 0 };
  }
}

export default async function HomePage() {
  const stats = await getHeroStats();
  return (
    <div className="flex flex-col min-h-screen bg-night">
      <Navbar />
      <main className="flex-1">
        <HeroSection stats={stats} />
        <HowItWorksSection dealerCount={stats.dealers} />
        <TrustSection />
        <Suspense>
          <TrendingLocalDealers />
        </Suspense>
        <Suspense>
          <FirstReviewerSection />
        </Suspense>
        <Suspense>
          <RecentReviewsSection />
        </Suspense>
        <CategoriesSection />
        <BrandsSection />
        <section className="py-10 bg-night border-t border-white/5" aria-label="Sponsored automotive offers">
          <div className="container grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <AutomotiveAdBanner type="Tier2_OEM_Offer" slot="homepage_financing" />
            <AutomotiveAdBanner type="Sponsored_Local_Dealer" slot="homepage_dealer" />
            <AutomotiveAdBanner type="Auto_Ecosystem_Partner" slot="homepage_insurance" />
          </div>
        </section>
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
