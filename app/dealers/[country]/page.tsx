import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { publicDealerWhere } from "@/lib/dealer/status";
import { DealerCard } from "@/components/dealership/DealerCard";
import Link from "next/link";
import { stateHref, stateSlug } from "@/lib/geo";

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
  const country = await getCountryData(countryCode);
  if (!country) notFound();

  const [dealers, states] = await Promise.all([
    getDealersByCountry(country.id),
    getStatesByCountry(country.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container py-8">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/dealers" className="hover:text-gold-700">Dealers</Link>
            {" / "}
            <span className="text-gray-900">{country.name}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            {country.flagEmoji} Car Dealerships in {country.name}
          </h1>
          <p className="text-gray-600 mt-2">{country.dealerCount.toLocaleString()} dealerships listed</p>
        </div>
      </div>

      <div className="container py-8">
        {/* States */}
        {states.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse by state / region</h2>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <Link
                  key={state.slug}
                  href={stateHref(countryCode, state.slug, state.name)!}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gold-300 hover:text-gold-800 transition-colors"
                >
                  {state.name}
                  <span className="ml-1.5 text-gray-400 text-xs">{state.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {country.cities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse by city</h2>
            <div className="flex flex-wrap gap-2">
              {country.cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/dealers/${countryCode}/${city.slug}`}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gold-300 hover:text-gold-800 transition-colors"
                >
                  {city.name}
                  <span className="ml-1.5 text-gray-400 text-xs">{city.dealerCount}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dealers */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top-rated dealerships</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as any} />
          ))}
        </div>

        {dealers.length === 0 && (
          <p className="text-center py-12 text-gray-500">No dealerships listed yet in {country.name}.</p>
        )}
      </div>
    </div>
  );
}
