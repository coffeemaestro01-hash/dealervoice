import Link from "next/link";
import prisma from "@/lib/db";
import { DealerCard } from "@/components/dealership/DealerCard";
import { TrendingUp } from "lucide-react";
import { publicDealerWhere } from "@/lib/dealer/status";

async function getTrendingDealers() {
  const withReviews = await prisma.dealership.findMany({
    where: { ...publicDealerWhere, totalReviews: { gt: 0 } },
    take: 9,
    orderBy: [
      { isSponsored: "desc" },
      { totalReviews: "desc" },
      { overallRating: "desc" },
      { reputationScore: "desc" },
    ],
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: {
        include: { brand: { select: { name: true, slug: true, logoUrl: true } } },
        take: 5,
      },
      subscription: { select: { plan: true } },
    },
  });

  if (withReviews.length >= 6) return withReviews;

  const fallback = await prisma.dealership.findMany({
    where: publicDealerWhere,
    take: 9,
    orderBy: [
      { isSponsored: "desc" },
      { isFeatured: "desc" },
      { reputationScore: "desc" },
      { totalReviews: "desc" },
    ],
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: {
        include: { brand: { select: { name: true, slug: true, logoUrl: true } } },
        take: 5,
      },
      subscription: { select: { plan: true } },
    },
  });

  const seen = new Set(withReviews.map((d) => d.id));
  return [...withReviews, ...fallback.filter((d) => !seen.has(d.id))].slice(0, 9);
}

export async function TrendingLocalDealers() {
  let dealers: Awaited<ReturnType<typeof getTrendingDealers>> = [];
  try {
    dealers = await getTrendingDealers();
  } catch {
    return null;
  }

  if (dealers.length === 0) return null;

  return (
    <section aria-labelledby="trending-dealers-heading" className="py-14 md:py-16 bg-night-soft border-y border-white/5">
      <div className="container">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-2">
              <TrendingUp size={16} aria-hidden />
              Live marketplace
            </div>
            <h2 id="trending-dealers-heading" className="text-2xl md:text-3xl font-bold text-white">
              Trending <span className="text-gold">Local Dealers</span>
            </h2>
            <p className="text-gray-400 mt-1 text-sm md:text-base">
              Top dealerships by reviews and reputation in your network.
            </p>
          </div>
          <Link
            href="/dealers"
            className="text-sm font-semibold text-gold-400 hover:text-gold-300 shrink-0"
          >
            Search all dealers →
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as never} />
          ))}
        </div>
      </div>
    </section>
  );
}
