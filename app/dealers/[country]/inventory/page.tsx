import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Car, ArrowLeft } from "lucide-react";
import { formatIncomeMinor } from "@/lib/income/ledger";
import { MARKET_LABELS } from "@/lib/geo/market";

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const code = country.toUpperCase();
  const label = MARKET_LABELS[code] ?? code;
  return {
    title: `Car inventory — ${label}`,
    description: `Browse vehicles listed by dealerships in ${label} on DealerVoice.`,
  };
}

export default async function CountryInventoryPage({ params }: Props) {
  const { country } = await params;
  const code = country.toUpperCase();

  const countryRow = await prisma.country.findFirst({
    where: { code, isActive: true },
  });
  if (!countryRow) notFound();

  const listings = await prisma.vehicleListing.findMany({
    where: { countryCode: code, isActive: true },
    orderBy: { listedAt: "desc" },
    take: 48,
    include: {
      dealership: { select: { name: true, slug: true, cityName: true, stateName: true } },
    },
  });

  const label = MARKET_LABELS[code] ?? countryRow.name;

  return (
    <div className="bg-white min-h-screen">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-10 max-w-4xl">
          <Link
            href={code === "IN" ? "/dealers/in" : `/dealers/${country}`}
            className="inline-flex items-center gap-1 text-sm text-gold-700 hover:underline mb-4"
          >
            <ArrowLeft size={14} /> Back to {label} dealers
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Car className="text-gold-600" size={28} />
            Vehicles in {label}
          </h1>
          <p className="text-gray-600 mt-2">
            Dealer-uploaded inventory on DealerVoice. Listings grow as dealers claim profiles and add stock.
          </p>
        </div>
      </section>

      <section className="py-10 container max-w-4xl">
        {listings.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-600">No vehicles listed in {label} yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Dealers on Pro can add listings from their dashboard.{" "}
              <Link href="/pricing" className="text-gold-700 hover:underline">
                View plans
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {listings.map((v) => (
              <Link
                key={v.id}
                href={`/dealership/${v.dealership.slug}`}
                className="rounded-xl border border-gray-100 p-5 hover:border-gold/40 hover:shadow-sm transition-all"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                  {[v.dealership.cityName, v.dealership.stateName].filter(Boolean).join(", ")}
                </p>
                <h2 className="font-bold text-gray-900 mt-1">
                  {[v.year, v.make, v.model].filter(Boolean).join(" ")}
                </h2>
                {v.trim && <p className="text-sm text-gray-600">{v.trim}</p>}
                <p className="text-lg font-semibold text-gold-800 mt-2">
                  {v.priceLabel ?? (v.priceMinor != null ? formatIncomeMinor(v.priceMinor, v.currency) : "POA")}
                </p>
                <p className="text-xs text-gray-500 mt-1">{v.dealership.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
