import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/db";
import { DealershipProfile } from "@/components/dealership/DealershipProfile";
import { ReviewsList } from "@/components/review/ReviewsList";
import { DealershipSidebar } from "@/components/dealership/DealershipSidebar";
import { QuoteRequestForm } from "@/components/dealership/QuoteRequestForm";
import { RatingDistribution } from "@/components/dealership/RatingDistribution";
import { ClaimModal } from "@/components/dealership/ClaimModal";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getDealership(slug: string) {
  const cached = await getCache(CACHE_KEYS.dealership(slug));
  if (cached) return cached as Awaited<ReturnType<typeof fetchDealership>>;
  const data = await fetchDealership(slug);
  if (data) await setCache(CACHE_KEYS.dealership(slug), data, CACHE_TTL.MEDIUM);
  return data;
}

async function fetchDealership(slug: string) {
  return prisma.dealership.findUnique({
    where: { slug, deletedAt: null },
    include: {
      country: true,
      city: true,
      brands: { include: { brand: true }, orderBy: { isPrimary: "desc" } },
      awards: { orderBy: { year: "desc" } },
      subscription: { select: { plan: true } },
      media: { where: { type: "IMAGE" }, take: 10 },
      _count: { select: { reviews: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getDealership(slug);
  if (!dealer) return {};
  const location = [dealer.cityName, dealer.stateName, dealer.country?.name].filter(Boolean).join(", ");
  return {
    title: `${dealer.name} Reviews - ${location}`,
    description:
      dealer.description ??
      `Read ${dealer.totalReviews} verified reviews for ${dealer.name} in ${location}. Overall rating: ${dealer.overallRating.toFixed(1)}/5.`,
    openGraph: {
      title: `${dealer.name} - ${dealer.overallRating.toFixed(1)}★ (${dealer.totalReviews} reviews)`,
      description: dealer.description ?? `Dealership reviews for ${dealer.name}`,
      images: dealer.coverImageUrl ? [{ url: dealer.coverImageUrl }] : [],
    },
  };
}

export default async function DealershipPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const dealer = await getDealership(slug);
  if (!dealer) notFound();

  const page = Number(pageParam ?? 1);

  // Schema.org LocalBusiness + Review aggregate markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealer.name,
    description: dealer.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address,
      addressLocality: dealer.cityName,
      addressRegion: dealer.stateName,
      addressCountry: dealer.country?.code,
      postalCode: dealer.postalCode,
    },
    telephone: dealer.phone,
    url: dealer.website,
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
        <ClaimModal dealershipId={dealer.id} dealershipName={dealer.name} />
      </Suspense>

      <div className="min-h-screen bg-gray-50">
        <DealershipProfile dealer={dealer as any} />

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <RatingDistribution dealer={dealer as any} />
              <Suspense>
                <ReviewsList dealershipId={dealer.id} page={page} />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <QuoteRequestForm dealershipId={dealer.id} dealerName={dealer.name} />
              <DealershipSidebar dealer={dealer as any} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
