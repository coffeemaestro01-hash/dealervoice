import Link from "next/link";
import prisma from "@/lib/db";
import type { DealerStatus } from "@prisma/client";
import { StarRating } from "@/components/common/StarRating";
import { AutomotiveAdBanner } from "@/components/ads/AutomotiveAdBanner";

interface Props {
  dealershipId: string;
  cityId?: string | null;
  stateName?: string | null;
  countryId: string;
  countryCode?: string | null;
}

async function getNearbyDealers({ dealershipId, cityId, stateName, countryId }: Props) {
  const where = {
    id: { not: dealershipId },
    deletedAt: null,
    status: { in: ["ACTIVE", "CLAIMED"] as DealerStatus[] },
    totalReviews: { gt: 0 },
    countryId,
    ...(cityId ? { cityId } : stateName ? { stateName } : {}),
  };

  return prisma.dealership.findMany({
    where,
    take: 3,
    orderBy: [{ overallRating: "desc" }, { totalReviews: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      cityName: true,
      stateName: true,
      overallRating: true,
      totalReviews: true,
      country: { select: { code: true, name: true } },
      city: { select: { slug: true, name: true } },
    },
  });
}

export async function CompetitorAdPlacement(props: Props) {
  const countryCode = props.countryCode ?? "US";
  let nearby: Awaited<ReturnType<typeof getNearbyDealers>> = [];
  try {
    nearby = await getNearbyDealers(props);
  } catch {
    return (
      <section aria-label="Sponsored dealer alternatives" className="space-y-4">
        <AutomotiveAdBanner type="Sponsored_Local_Dealer" slot="profile_competitor_fallback" countryCode={countryCode} />
        <AutomotiveAdBanner type="Tier2_OEM_Offer" compact slot="profile_financing_fallback" countryCode={countryCode} />
      </section>
    );
  }

  return (
    <section
      aria-label="Sponsored alternative dealers nearby"
      className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-5 md:p-6 shadow-sm"
    >
      <header className="mb-4">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1">
          Sponsored Alternative
        </p>
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          Highly Rated Dealers Nearby
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Car buyers in your area also trust these dealerships.
        </p>
      </header>

      {nearby.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="list">
          {nearby.map((dealer) => (
            <li key={dealer.id}>
              <Link
                href={`/dealership/${dealer.slug}`}
                className="block h-full bg-card rounded-xl border border-primary/30 p-4 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <p className="font-semibold text-foreground text-sm line-clamp-2">{dealer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[dealer.cityName, dealer.stateName].filter(Boolean).join(", ")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={dealer.overallRating} size="sm" />
                  <span className="text-xs font-medium text-foreground">
                    {dealer.overallRating.toFixed(1)} ({dealer.totalReviews})
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <AutomotiveAdBanner type="Sponsored_Local_Dealer" slot="profile_competitor" countryCode={countryCode} />
      )}

      <div className="mt-4 pt-4 border-t border-primary/30">
        <AutomotiveAdBanner type="Tier2_OEM_Offer" compact slot="profile_financing" countryCode={countryCode} />
      </div>
    </section>
  );
}
