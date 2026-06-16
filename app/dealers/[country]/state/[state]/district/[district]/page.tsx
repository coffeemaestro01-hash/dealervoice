import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { DealerCard } from "@/components/dealership/DealerCard";
import { districtSlug } from "@/lib/geo";
import { stateSlug, stateHref } from "@/lib/geo";

interface Props {
  params: Promise<{ country: string; state: string; district: string }>;
}

async function getDistrictData(countryCode: string, stateParam: string, districtParam: string) {
  const country = await prisma.country.findUnique({
    where: { code: countryCode.toUpperCase() },
    select: { id: true, code: true, name: true, flagEmoji: true },
  });
  if (!country) return null;

  const stateFilter = {
    OR: [
      { stateCode: { equals: stateParam, mode: "insensitive" as const } },
      { stateName: { contains: stateParam.replace(/-/g, " "), mode: "insensitive" as const } },
    ],
  };

  const sample = await prisma.dealership.findFirst({
    where: { countryId: country.id, deletedAt: null, ...stateFilter, districtName: { not: null } },
    select: { stateName: true, stateCode: true, districtName: true },
  });
  if (!sample) return null;

  const districts = await prisma.dealership.groupBy({
    by: ["districtName"],
    where: { countryId: country.id, deletedAt: null, ...stateFilter, districtName: { not: null } },
    _count: { id: true },
  });

  const match = districts.find((d) => d.districtName && districtSlug(d.districtName) === districtParam);
  if (!match?.districtName) return null;

  const districtName = match.districtName;
  const stateName = sample.stateName ?? stateParam.replace(/-/g, " ");
  const stateCode = sample.stateCode;

  const [dealers, dealerCount] = await Promise.all([
    prisma.dealership.findMany({
      where: {
        countryId: country.id,
        deletedAt: null,
        districtName: { equals: districtName, mode: "insensitive" },
        ...stateFilter,
      },
      take: 24,
      orderBy: [{ reputationScore: "desc" }, { name: "asc" }],
      include: {
        country: { select: { name: true, code: true } },
        city: { select: { name: true, slug: true } },
        brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
        subscription: { select: { plan: true } },
      },
    }),
    prisma.dealership.count({
      where: {
        countryId: country.id,
        deletedAt: null,
        districtName: { equals: districtName, mode: "insensitive" },
        ...stateFilter,
      },
    }),
  ]);

  return { country, stateName, stateCode, districtName, dealerCount, dealers, stateParam };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, state, district } = await params;
  const data = await getDistrictData(country, state, district);
  if (!data) return { title: "District Not Found" };
  return {
    title: `Car Dealerships in ${data.districtName}, ${data.stateName} | DealerVoice`,
    description: `Find car dealerships in ${data.districtName}, ${data.stateName}, ${data.country.name}. Compare ratings and read verified reviews.`,
    alternates: { canonical: `/dealers/${country}/state/${state}/district/${district}` },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { country: countryCode, state: stateParam, district: districtParam } = await params;
  const data = await getDistrictData(countryCode, stateParam, districtParam);
  if (!data) notFound();

  const { country, stateName, dealerCount, dealers, districtName } = data;
  const countryHref = `/dealers/${country.code.toLowerCase()}`;
  const stateLink = stateHref(country.code, stateSlug(data.stateCode, stateName), stateName);

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-card border-b border-border">
        <div className="container py-8">
          <nav className="text-sm text-muted-foreground mb-2">
            <Link href="/dealers" className="hover:text-primary">Dealers</Link>
            {" / "}
            <Link href={countryHref} className="hover:text-primary">{country.name}</Link>
            {" / "}
            {stateLink && <Link href={stateLink} className="hover:text-primary">{stateName}</Link>}
            {" / "}
            <span className="text-foreground">{districtName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            {country.flagEmoji} Car Dealerships in {districtName}
          </h1>
          <p className="text-muted-foreground mt-2">
            {dealerCount.toLocaleString()} dealership{dealerCount === 1 ? "" : "s"} in {districtName}, {stateName}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Dealerships in {districtName}</h2>
        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer as any} />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No dealerships listed in {districtName} yet.</p>
        )}
      </div>
    </div>
  );
}
