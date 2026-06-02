import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedDealers } from "@/components/home/FeaturedDealers";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice - Trusted Dealership Reviews Worldwide",
  description: "Discover honest, verified reviews for car dealerships worldwide. Read real customer experiences and make informed decisions.",
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection stats={stats} />
        <TrustSection />
        <CategoriesSection />
        <Suspense>
          <FeaturedDealers />
        </Suspense>
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
