import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { DealerCard } from "@/components/dealership/DealerCard";

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
      subscription: { select: { plan: true } },
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
  const { country: countryCode, city: citySlug } = await params;
  const data = await getCityData(countryCode, citySlug);
  if (!data) notFound();

  const { country, city } = data;
  const dealers = await getDealersByCity(city.id);
  const countryHref = `/dealers/${country.code.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container py-8">
          <nav className="text-sm text-gray-500 mb-2" data-testid="city-breadcrumb">
            <Link href="/dealers" className="hover:text-gold-700">Dealers</Link>
            {" / "}
            <Link href={countryHref} className="hover:text-gold-700">{country.name}</Link>
            {" / "}
            <span className="text-gray-900">{city.name}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="city-page-title">
            {country.flagEmoji} Car Dealerships in {city.name}
            {city.stateName ? <span className="text-gray-500 font-normal">, {city.stateName}</span> : null}
          </h1>
          <p className="text-gray-600 mt-2" data-testid="city-dealer-count">
            {city.dealerCount.toLocaleString()} dealership{city.dealerCount === 1 ? "" : "s"} listed
          </p>
        </div>
      </div>

      <div className="container py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top-rated dealerships in {city.name}</h2>

        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="city-dealers-grid">
            {dealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500" data-testid="city-no-dealers">
            <p>No dealerships listed yet in {city.name}.</p>
            <Link href={countryHref} className="inline-block mt-3 text-gold-700 hover:underline">
              View all dealers in {country.name} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
