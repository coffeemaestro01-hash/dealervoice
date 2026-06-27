import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalCoverageSection } from "@/components/home/GlobalCoverageSection";
import { ChicagoCoverageSection } from "@/components/home/ChicagoCoverageSection";
import { TrendingLocalDealers } from "@/components/home/TrendingLocalDealers";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { FirstReviewerSection } from "@/components/home/FirstReviewerSection";

export const metadata: Metadata = {
  title: "Explore Dealers — Directory & Coverage | DealerVoice",
  description:
    "Browse car dealerships by country, city, brand, and category. Discover trending dealers and coverage across the DealerVoice network.",
};

export default function ExplorePage() {
  return (
    <>
      <section className="py-14 md:py-16 border-b border-border bg-pearl/40">
        <div className="container max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Explore</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Discover dealerships across the network
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Browse by location, brand, or category — or jump straight into search when you know what you need.
          </p>
          <Link href="/dealers" className="inline-block mt-6">
            <Button className="gap-2 font-semibold">
              <Search size={18} />
              Search all dealers
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Suspense>
        <GlobalCoverageSection />
      </Suspense>
      <Suspense>
        <ChicagoCoverageSection />
      </Suspense>
      <Suspense>
        <TrendingLocalDealers />
      </Suspense>
      <CategoriesSection />
      <Suspense>
        <BrandsSection />
      </Suspense>
      <Suspense>
        <FirstReviewerSection />
      </Suspense>
    </>
  );
}
