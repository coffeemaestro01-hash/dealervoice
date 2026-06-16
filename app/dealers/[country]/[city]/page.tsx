import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { publicDealerFilter } from "@/lib/dealer/status";
import { DealerCard } from "@/components/dealership/DealerCard";
import { isUsStateSlug, US_STATE_BY_SLUG } from "@/lib/geo/us-states";
import { citySlug } from "@/lib/dealers/seo-url";

interface Props {
  params: Promise<{ country: string; city: string }>;
}

async function getCityData(countryCode: string, citySlug: string) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode.toUpperCase() },
    select: { id: true, code: true, name: true, flagEmoji: true },
  });
  if (!country) return null;

  const city = await prisma.city.findFirst({
    where: { slug: citySlug, countryId: country.id, isActive: true },
    select: { id: true, name: true, slug: true, stateName: true, dealerCount: true },
  });
  if (!city) return null;

  return { country, city };
}

async function getDealersByCity(cityId: string) {
  return prisma.dealership.findMany({
    where: { cityId, deletedAt: null },
    take: 60,
    orderBy: [{ reputationScore: "desc" }, { name: "asc" }],
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
      subscription: { select: { plan: true, status: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryCode, city: citySlug } = await params;
  const data = await getCityData(countryCode, citySlug);
  if (!data) return { title: "City Not Found" };
  const { country, city } = data;
  return {
    title: `Car Dealerships in ${city.name}, ${country.name} | DealerVoice`,
    description: `Find trusted car dealerships in ${city.name}, ${country.name}. Read verified reviews and compare ratings.`,
    alternates: { canonical: `/dealers/${country.code.toLowerCase()}/${city.slug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { country: countryCode, city: citySlugParam } = await params;

  if (isUsStateSlug(countryCode)) {
    const state = US_STATE_BY_SLUG[countryCode.toLowerCase()];
    const us = await prisma.country.findUnique({ where: { code: "US" } });
    if (!us) notFound();

    const dealers = await prisma.dealership.findMany({
      where: {
        countryId: us.id,
        ...publicDealerFilter(),
        OR: [
          { stateCode: { equals: state.code, mode: "insensitive" } },
          { stateName: { contains: state.name, mode: "insensitive" } },
        ],
      },
      take: 200,
      orderBy: { reputationScore: "desc" },
      include: {
        country: { select: { name: true, code: true } },
        brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 3 },
        subscription: { select: { plan: true, status: true } },
      },
    });

    const filtered = dealers.filter((d) => citySlug(d.cityName) === citySlugParam);
    const cityLabel = filtered[0]?.cityName ?? citySlugParam.replace(/-/g, " ");
    if (filtered.length === 0) notFound();

    return (
      <div className="min-h-screen bg-muted">
        <div className="bg-card border-b border-border">
          <div className="container py-8">
            <nav className="text-sm text-muted-foreground mb-2">
              <Link href="/dealers" className="hover:text-primary">Dealers</Link>
              {" / "}
              <Link href={`/dealers/${countryCode}`} className="hover:text-primary">{state.name}</Link>
              {" / "}
              <span className="text-foreground">{cityLabel}</span>
            </nav>
            <h1 className="text-3xl font-bold text-foreground">Car dealerships in {cityLabel}, {state.name}</h1>
          </div>
        </div>
        <div className="container py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <DealerCard key={d.id} dealer={d as any} />
          ))}
        </div>
      </div>
    );
  }

  const data = await getCityData(countryCode, citySlugParam);
  if (!data) notFound();

  const { country, city } = data;
  const dealers = await getDealersByCity(city.id);
  const countryHref = `/dealers/${country.code.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <nav className="text-sm text-muted-foreground mb-2" data-testid="city-breadcrumb">
            <Link href="/dealers" className="hover:text-primary">Dealers</Link>
            {" / "}
            <Link href={countryHref} className="hover:text-primary">{country.name}</Link>
            {" / "}
            <span className="text-foreground">{city.name}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground" data-testid="city-page-title">
            {country.flagEmoji} Car Dealerships in {city.name}
            {city.stateName ? <span className="text-muted-foreground font-normal">, {city.stateName}</span> : null}
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="city-dealer-count">
            {city.dealerCount.toLocaleString()} dealership{city.dealerCount === 1 ? "" : "s"} listed
          </p>
        </div>
      </div>

      <div className="container py-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Top-rated dealerships in {city.name}</h2>

        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="city-dealers-grid">
            {dealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground" data-testid="city-no-dealers">
            <p>No dealerships listed yet in {city.name}.</p>
            <Link href={countryHref} className="inline-block mt-3 text-primary hover:underline">
              View all dealers in {country.name} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
