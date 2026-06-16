import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/db";
import { DealershipProfile } from "@/components/dealership/DealershipProfile";
import { ReviewsList } from "@/components/review/ReviewsList";
import { DealershipSidebar } from "@/components/dealership/DealershipSidebar";
import { QuoteRequestForm } from "@/components/dealership/QuoteRequestForm";
import { RatingDistribution } from "@/components/dealership/RatingDistribution";
import { ClaimModal } from "@/components/dealership/ClaimModal";
import { CompetitorAdPlacement } from "@/components/dealership/CompetitorAdPlacement";
import { ClaimProfileCTA } from "@/components/dealership/ClaimProfileCTA";
import { PremiumInventoryCTA } from "@/components/dealership/PremiumInventoryCTA";
import { DealerInventorySection } from "@/components/dealership/DealerInventorySection";
import { ProfileWriteBar } from "@/components/dealership/ProfileWriteBar";
import { isDealerPremiumClaimed } from "@/lib/dealer/premium";
import { TrustScoreBreakdown } from "@/components/trust/TrustScoreBreakdown";
import { AIReviewDigest } from "@/components/trust/AIReviewDigest";
import { DreamCarAssistant } from "@/components/trust/DreamCarAssistant";
import { computeTrustScore } from "@/lib/trust/score";
import { generateReviewDigest } from "@/lib/ai/review-digest";
import { getDealershipBySlug } from "@/lib/dealers/load-dealership";
import { dealerCanonicalUrl } from "@/lib/dealers/seo-url";

interface Props {
  slug: string;
  page?: number;
  highlightWrite?: boolean;
}

export async function DealershipRoute({ slug, page = 1, highlightWrite = false }: Props) {
  const dealer = await getDealershipBySlug(slug);
  if (!dealer) notFound();

  const isPremium = isDealerPremiumClaimed(dealer);
  const trustScore = computeTrustScore({
    reputationScore: dealer.reputationScore,
    isVerified: dealer.isVerified,
    isPremiumClaimed: dealer.isPremiumClaimed,
    avgRating: dealer.overallRating,
    totalReviews: dealer.totalReviews,
    verifiedReviews: dealer.verifiedReviews,
    responseRate: dealer.responseRate ?? 0,
  });

  const recentReviews = await prisma.review.findMany({
    where: { dealershipId: dealer.id, status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { title: true, body: true, overallRating: true },
  });
  const reviewDigest = await generateReviewDigest(recentReviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.name,
    description: dealer.description,
    url: dealerCanonicalUrl(dealer),
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address,
      addressLocality: dealer.cityName,
      addressRegion: dealer.stateName,
      addressCountry: dealer.country?.code,
      postalCode: dealer.postalCode,
    },
    telephone: dealer.phone,
    sameAs: dealer.website,
    aggregateRating:
      dealer.totalReviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: dealer.overallRating.toFixed(1),
            reviewCount: dealer.totalReviews,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Suspense>
        <ClaimModal dealershipId={dealer.id} dealershipName={dealer.name} dealershipSlug={dealer.slug} />
      </Suspense>

      <div className="min-h-screen bg-muted pb-20 md:pb-0">
        {highlightWrite && (
          <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5 text-center text-sm text-foreground">
            You&apos;re here to review <strong>{dealer.name}</strong> — tap Write Review below.
          </div>
        )}
        <DealershipProfile dealer={dealer as any} isPremium={isPremium} highlightWrite={highlightWrite} />
        <ProfileWriteBar dealershipId={dealer.id} highlight={highlightWrite} />

        <div className="container py-8">
          {isPremium && (
            <div className="mb-6">
              <PremiumInventoryCTA dealer={dealer} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!isPremium && (
                <CompetitorAdPlacement
                  dealershipId={dealer.id}
                  cityId={dealer.cityId}
                  stateName={dealer.stateName}
                  countryId={dealer.countryId}
                  countryCode={dealer.country?.code ?? "US"}
                />
              )}
              <DealerInventorySection
                dealershipId={dealer.id}
                dealerName={dealer.name}
                countryCode={dealer.country?.code ?? "US"}
                inventoryUrl={dealer.inventoryUrl}
                isPremium={isPremium}
              />
              <RatingDistribution dealer={dealer as any} />
              <Suspense>
                <ReviewsList dealershipId={dealer.id} page={page} />
              </Suspense>
              {!isPremium && (
                <ClaimProfileCTA dealerId={dealer.id} dealerName={dealer.name} dealerSlug={dealer.slug} />
              )}
            </div>

            <div className="space-y-5">
              <TrustScoreBreakdown trust={trustScore} />
              <AIReviewDigest digest={reviewDigest} />
              <QuoteRequestForm dealershipId={dealer.id} dealerName={dealer.name} />
              <DealershipSidebar dealer={dealer as any} isPremium={isPremium} />
            </div>
          </div>
        </div>
      </div>

      <DreamCarAssistant
        dealerContext={{
          name: dealer.name,
          city: dealer.cityName,
          rating: dealer.overallRating,
          slug: dealer.slug,
        }}
      />
    </>
  );
}
