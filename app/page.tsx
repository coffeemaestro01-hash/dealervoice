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
import { BrandsSection } from "@/components/home/BrandsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice — Find Verified Car Dealer Reviews Near You",
  description:
    "Search local car dealerships, read verified buyer reviews, and compare ratings. The automotive review platform trusted by car buyers nationwide.",
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
        <TrustSection />
        <CategoriesSection />
        <Suspense>
          <TrendingLocalDealers />
        </Suspense>
        <section className="py-10 bg-night border-t border-white/5">
          <div className="container grid grid-cols-1 md:grid-cols-3 gap-4">
            <AutomotiveAdBanner type="Tier2_OEM_Offer" />
            <AutomotiveAdBanner type="Sponsored_Local_Dealer" />
            <AutomotiveAdBanner type="Auto_Ecosystem_Partner" />
          </div>
        </section>
        <HowItWorksSection />
        <Suspense>
          <RecentReviewsSection />
        </Suspense>
        <BrandsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
