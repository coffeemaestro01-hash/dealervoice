import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import { DealerCard } from "@/components/dealership/DealerCard";
import Link from "next/link";
import { stateHref, stateSlug } from "@/lib/geo";
import { isUsStateSlug, US_STATE_BY_SLUG } from "@/lib/geo/us-states";
import { citySlug } from "@/lib/dealers/seo-url";

interface Props {
  params: Promise<{ country: string }>;
}

async function getCountryData(code: string) {
  return prisma.country.findUnique({
    where: { code: code.toUpperCase() },
    include: { cities: { where: { isActive: true, dealerCount: { gt: 0 } }, orderBy: { dealerCount: "desc" }, take: 20 } },
  });
}

async function getStatesByCountry(countryId: string) {
  const rows = await prisma.dealership.groupBy({
    by: ["stateCode", "stateName"],
    where: { countryId, deletedAt: null, OR: [{ stateCode: { not: null } }, { stateName: { not: null } }] },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 30,
  });
  return rows
    .filter((r) => r.stateCode || r.stateName)
    .map((r) => ({
      name: r.stateName ?? r.stateCode ?? "",
      slug: stateSlug(r.stateCode, r.stateName),
      count: r._count.id,
    }))
    .filter((s) => s.slug);
}

async function getDealersByCountry(countryId: string) {
  return prisma.dealership.findMany({
    where: { countryId, ...publicDealerWhere },
    take: 20,
    orderBy: { reputationScore: "desc" },
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
      subscription: { select: { plan: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryCode } = await params;
  const country = await getCountryData(countryCode);
  if (!country) return {};
  return {
    title: `Car Dealerships in ${country.name}`,
    description: `Find trusted car dealerships in ${country.name}. Read verified reviews and compare ratings.`,
  };
}

export default async function CountryPage({ params }: Props) {
  const { country: countryCode } = await params;

  // US SEO paths: /dealers/illinois → state directory
  if (isUsStateSlug(countryCode)) {
    const state = US_STATE_BY_SLUG[countryCode.toLowerCase()];
    const us = await prisma.country.findUnique({ where: { code: "US" } });
    if (!us) notFound();

    const dealers = await prisma.dealership.findMany({
      where: {
        countryId: us.id,
        ...publicDealerWhere,
        OR: [
          { stateCode: { equals: state.code, mode: "insensitive" } },
          { stateName: { contains: state.name, mode: "insensitive" } },
        ],
      },
      take: 24,
      orderBy: { reputationScore: "desc" },
      include: {
        country: { select: { name: true, code: true } },
        brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 3 },
        subscription: { select: { plan: true } },
      },
    });

    const cityCounts = await prisma.dealership.groupBy({
      by: ["cityName"],
      where: {
        countryId: us.id,
        ...publicDealerWhere,
        OR: [
          { stateCode: { equals: state.code, mode: "insensitive" } },
          { stateName: { contains: state.name, mode: "insensitive" } },
        ],
        cityName: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 30,
    });

    return (
      <div className="min-h-screen bg-muted">
        <div className="bg-card border-b border-border">
          <div className="container py-8">
            <nav className="text-sm text-muted-foreground mb-2">
              <Link href="/dealers" className="hover:text-primary">Dealers</Link>
              {" / "}
              <span className="text-foreground">{state.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-foreground">Franchised dealers in {state.name}</h1>
            <p className="text-muted-foreground mt-2">{dealers.length}+ dealerships indexed</p>
          </div>
        </div>
        <div className="container py-8">
          {cityCounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">Browse by city</h2>
              <div className="flex flex-wrap gap-2">
                {cityCounts.map((c) => (
                  <Link
                    key={c.cityName!}
                    href={`/dealers/${countryCode}/${citySlug(c.cityName)}`}
                    className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground hover:border-primary/30"
                  >
                    {c.cityName}
                    <span className="ml-1.5 text-muted-foreground text-xs">{c._count.id}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dealers.map((d) => (
              <DealerCard key={d.id} dealer={d as any} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const country = await getCountryData(countryCode);
  if (!country) notFound();

  const [dealers, states] = await Promise.all([
    getDealersByCountry(country.id),
    getStatesByCountry(country.id),
  ]);

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <nav className="text-sm text-muted-foreground mb-2">
            <Link href="/dealers" className="hover:text-primary">Dealers</Link>
            {" / "}
            <span className="text-foreground">{country.name}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            {country.flagEmoji} Car Dealerships in {country.name}
          </h1>
          <p className="text-muted-foreground mt-2">{country.dealerCount.toLocaleString()} dealerships listed</p>
        </div>
      </div>

      <div className="container py-8">
        {/* States */}
        {states.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">Browse by state / region</h2>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <Link
                  key={state.slug}
                  href={stateHref(countryCode, state.slug, state.name)!}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {state.name}
                  <span className="ml-1.5 text-muted-foreground text-xs">{state.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {country.cities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">Browse by city</h2>
            <div className="flex flex-wrap gap-2">
              {country.cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/dealers/${countryCode}/${city.slug}`}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {city.name}
                  <span className="ml-1.5 text-muted-foreground text-xs">{city.dealerCount}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dealers */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Top-rated dealerships</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as any} />
          ))}
        </div>

        {dealers.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">No dealerships listed yet in {country.name}.</p>
        )}
      </div>
    </div>
  );
}
