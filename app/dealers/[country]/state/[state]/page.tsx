import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { DealerCard } from "@/components/dealership/DealerCard";
import { stateSlug } from "@/lib/geo";
import { districtHref, districtSlug } from "@/lib/geo";

interface Props {
  params: Promise<{ country: string; state: string }>;
}

async function getStateData(countryCode: string, stateParam: string) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode.toUpperCase() },
    select: { id: true, code: true, name: true, flagEmoji: true },
  });
  if (!country) return null;

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: country.id,
      deletedAt: null,
      OR: [
        { stateCode: { equals: stateParam, mode: "insensitive" } },
        { stateName: { contains: stateParam.replace(/-/g, " "), mode: "insensitive" } },
      ],
    },
    select: { stateCode: true, stateName: true, cityName: true },
    take: 500,
  });

  if (dealers.length === 0) return null;

  const match = dealers.find(
    (d) => stateSlug(d.stateCode, d.stateName) === stateParam
  ) ?? dealers[0];

  const stateName = match.stateName ?? stateParam.replace(/-/g, " ").toUpperCase();
  const stateCode = match.stateCode;

  const cities = await prisma.dealership.groupBy({
    by: ["cityId", "cityName"],
    where: {
      countryId: country.id,
      deletedAt: null,
      stateCode: stateCode ?? undefined,
      stateName: stateCode ? undefined : { equals: stateName, mode: "insensitive" },
      cityId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 30,
  });

  const cityIds = cities.map((c) => c.cityId).filter(Boolean) as string[];
  const cityRecords = cityIds.length
    ? await prisma.city.findMany({
        where: { id: { in: cityIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const cityMap = new Map(cityRecords.map((c) => [c.id, c]));

  const topDealers = await prisma.dealership.findMany({
    where: {
      countryId: country.id,
      deletedAt: null,
      OR: stateCode
        ? [{ stateCode }]
        : [{ stateName: { equals: stateName, mode: "insensitive" } }],
    },
    take: 24,
    orderBy: [{ reputationScore: "desc" }, { name: "asc" }],
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
      subscription: { select: { plan: true } },
    },
  });

  const dealerCount = await prisma.dealership.count({
    where: {
      countryId: country.id,
      deletedAt: null,
      OR: stateCode
        ? [{ stateCode }]
        : [{ stateName: { equals: stateName, mode: "insensitive" } }],
    },
  });

  const districts = await prisma.dealership.groupBy({
    by: ["districtName"],
    where: {
      countryId: country.id,
      deletedAt: null,
      districtName: { not: null },
      OR: stateCode
        ? [{ stateCode }]
        : [{ stateName: { equals: stateName, mode: "insensitive" } }],
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 40,
  });

  return {
    country,
    stateName,
    stateCode,
    stateParam,
    dealerCount,
    topDealers,
    districts: districts
      .filter((d) => d.districtName)
      .map((d) => ({ name: d.districtName!, slug: districtSlug(d.districtName!), count: d._count.id })),
    cities: cities
      .map((c) => {
        const rec = c.cityId ? cityMap.get(c.cityId) : null;
        return {
          name: rec?.name ?? c.cityName ?? "Unknown",
          slug: rec?.slug ?? null,
          count: c._count.id,
        };
      })
      .filter((c) => c.slug),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryCode, state: stateParam } = await params;
  const data = await getStateData(countryCode, stateParam);
  if (!data) return { title: "State Not Found" };
  return {
    title: `Car Dealerships in ${data.stateName}, ${data.country.name} | DealerVoice`,
    description: `Find trusted car dealerships in ${data.stateName}, ${data.country.name}. Compare ratings and read verified reviews.`,
    alternates: { canonical: `/dealers/${countryCode}/state/${stateParam}` },
  };
}

export default async function StatePage({ params }: Props) {
  const { country: countryCode, state: stateParam } = await params;
  const data = await getStateData(countryCode, stateParam);
  if (!data) notFound();

  const { country, stateName, dealerCount, topDealers, cities, districts } = data;
  const countryHref = `/dealers/${country.code.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <nav className="text-sm text-muted-foreground mb-2">
            <Link href="/dealers" className="hover:text-primary">Dealers</Link>
            {" / "}
            <Link href={countryHref} className="hover:text-primary">{country.name}</Link>
            {" / "}
            <span className="text-foreground">{stateName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            {country.flagEmoji} Car Dealerships in {stateName}
          </h1>
          <p className="text-muted-foreground mt-2">
            {dealerCount.toLocaleString()} dealership{dealerCount === 1 ? "" : "s"} in {stateName}, {country.name}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {districts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">Districts in {stateName}</h2>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <Link
                  key={d.slug}
                  href={districtHref(country.code, stateParam, d.name)}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {d.name}
                  <span className="ml-1.5 text-muted-foreground text-xs">{d.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {cities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">Cities in {stateName}</h2>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.slug!}
                  href={`/dealers/${country.code.toLowerCase()}/${city.slug}`}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {city.name}
                  <span className="ml-1.5 text-muted-foreground text-xs">{city.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-4">Top-rated dealerships in {stateName}</h2>
        {topDealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topDealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer as any} />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No dealerships listed in {stateName} yet.</p>
        )}
      </div>
    </div>
  );
}
