import type { Metadata } from "next";
import { Suspense } from "react";
import { ForBuyersHero } from "@/components/home/ForBuyersHero";
import { BuyerJourneyStrip } from "@/components/home/BuyerJourneyStrip";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TrustSection } from "@/components/home/TrustSection";
import { DreamCarAssistant } from "@/components/trust/DreamCarAssistant";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "For Car Buyers — Find Trusted Dealers | DealerVoice",
  description:
    "Search car dealerships, read verified reviews, compare trust scores, and write your experience on DealerVoice.",
};

async function getDealerCount() {
  try {
    return await prisma.dealership.count({ where: { deletedAt: null } });
  } catch {
    return 0;
  }
}

export default async function ForBuyersPage() {
  const dealerCount = await getDealerCount();

  return (
    <>
      <ForBuyersHero />
      <BuyerJourneyStrip />
      <Suspense>
        <HowItWorksSection dealerCount={dealerCount} />
      </Suspense>
      <TrustSection />
      <section className="py-12 bg-pearl border-y border-border">
        <div className="container text-center max-w-xl">
          <h2 className="font-display text-xl font-bold text-foreground">Starting in Chicago?</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Our Illinois wedge has the deepest coverage — browse Chicagoland dealers and write a local review.
          </p>
          <Link href="/chicago" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mt-4">
            Explore Chicago <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <DreamCarAssistant />
    </>
  );
}
