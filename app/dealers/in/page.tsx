import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
import { publicDealerWhere } from "@/lib/dealer/status";
import { DealerCard } from "@/components/dealership/DealerCard";
import { INDIA_STATES, INDIA_LAUNCH_STATES, findIndiaState } from "@/lib/geo/india";
import { stateHref } from "@/lib/geo";

export const metadata: Metadata = {
  title: "Car Dealerships in India — All States & Districts | DealerVoice",
  description:
    "Find trusted car dealerships across India. Browse by state, district, and city. Read verified buyer reviews before you buy or service your vehicle.",
  alternates: { canonical: "/dealers/in" },
};

async function getIndiaHubData() {
  const country = await prisma.country.findUnique({
    where: { code: "IN" },
    include: { cities: { where: { isActive: true, dealerCount: { gt: 0 } }, orderBy: { dealerCount: "desc" }, take: 15 } },
  });
  if (!country) return null;

  const [dealers, emails, stateCounts, districtCount] = await Promise.all([
    prisma.dealership.findMany({
      where: { countryId: country.id, ...publicDealerWhere },
      take: 12,
      orderBy: [{ isSponsored: "desc" }, { reputationScore: "desc" }],
      include: {
        country: { select: { name: true, code: true } },
        city: { select: { name: true, slug: true } },
        brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 5 },
        subscription: { select: { plan: true } },
      },
    }),
    prisma.dealership.count({
      where: { countryId: country.id, deletedAt: null, email: { not: null }, NOT: { email: "" } },
    }),
    prisma.dealership.groupBy({
      by: ["stateName"],
      where: { countryId: country.id, deletedAt: null, stateName: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.dealership.groupBy({
      by: ["districtName"],
      where: { countryId: country.id, deletedAt: null, districtName: { not: null } },
      _count: { id: true },
    }),
  ]);

  const stateCountMap = new Map(stateCounts.map((s) => [s.stateName?.toLowerCase(), s._count.id]));

  return {
    country,
    dealers,
    emails,
    districtCount: districtCount.length,
    states: INDIA_STATES.map((s) => ({
      ...s,
      count: stateCountMap.get(s.name.toLowerCase()) ?? 0,
    })),
  };
}

export default async function IndiaDealersPage() {
  const data = await getIndiaHubData();
  if (!data) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">India coverage launching soon</h1>
        <Link href="/dealers" className="text-gold-700 mt-4 inline-block hover:underline">Browse all dealers</Link>
      </div>
    );
  }

  const { country, dealers, emails, districtCount, states } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-night text-white">
        <div className="container py-12 md:py-16">
          <nav className="text-sm text-gray-400 mb-3">
            <Link href="/dealers" className="hover:text-gold-400">Dealers</Link>
            {" / "}
            <span className="text-white">India</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            🇮🇳 Car Dealerships in India
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            {country.dealerCount.toLocaleString()} dealerships across {states.filter((s) => s.count > 0).length || 36} states & union territories
            {districtCount > 0 && ` · ${districtCount} districts`}
            {emails > 0 && ` · ${emails.toLocaleString()} public contact emails`}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {INDIA_LAUNCH_STATES.map((slug) => {
              const s = findIndiaState(slug);
              if (!s) return null;
              return (
                <Link
                  key={slug}
                  href={stateHref("in", s.code.split("-")[1], s.name)!}
                  className="px-4 py-2 rounded-full bg-gold-600/20 border border-gold/40 text-gold-300 text-sm font-medium hover:bg-gold-600/30"
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All states & union territories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-12">
          {states.map((s) => (
            <Link
              key={s.slug}
              href={stateHref("in", s.code.split("-")[1], s.name)!}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gold-300 hover:text-gold-800 transition-colors"
            >
              <span className="line-clamp-1">{s.name}</span>
              {s.count > 0 && <span className="block text-xs text-gray-400 mt-0.5">{s.count} dealers</span>}
            </Link>
          ))}
        </div>

        {country.cities.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Major cities</h2>
            <div className="flex flex-wrap gap-2">
              {country.cities.map((city) => (
                <Link
                  key={city.id}
                  href={`/dealers/in/${city.slug}`}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-gold-300"
                >
                  {city.name}
                  <span className="ml-1.5 text-gray-400 text-xs">{city.dealerCount}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured dealerships</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer) => (
            <DealerCard key={dealer.id} dealer={dealer as any} />
          ))}
        </div>
        {dealers.length === 0 && (
          <p className="text-center py-12 text-gray-500">India listings are being imported. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
