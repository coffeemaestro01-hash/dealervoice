import { Suspense } from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { FeaturedDealers } from "@/components/home/FeaturedDealers";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export const metadata: Metadata = {
  title: "DealerVoice – Trusted Dealership Reviews Worldwide",
  description: "Discover honest, verified reviews for car dealerships worldwide. Read real customer experiences and make informed decisions.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-night">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
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
