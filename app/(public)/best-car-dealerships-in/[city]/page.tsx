import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { publicDealerFilter } from "@/lib/dealer/status";
import { DealerCard } from "@/components/dealership/DealerCard";
import { citySlug } from "@/lib/dealers/seo-url";
import { US_STATE_BY_SLUG } from "@/lib/geo/us-states";
import { stateSlug } from "@/lib/geo";

interface Props {
  params: Promise<{ city: string }>;
}

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getCityDealers(citySlugParam: string) {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) return { dealers: [], cityLabel: titleCase(citySlugParam) };

  const dealers = await prisma.dealership.findMany({
    where: {
      countryId: us.id,
      ...publicDealerFilter(),
    },
    take: 200,
    orderBy: [{ reputationScore: "desc" }, { overallRating: "desc" }],
    include: {
      country: { select: { name: true, code: true } },
      brands: { include: { brand: { select: { name: true, slug: true, logoUrl: true } } }, take: 3 },
      subscription: { select: { plan: true } },
    },
  });

  const filtered = dealers.filter((d) => citySlug(d.cityName) === citySlugParam);
  const cityLabel =
    filtered[0]?.cityName ?? titleCase(citySlugParam);

  return { dealers: filtered.slice(0, 24), cityLabel };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const label = titleCase(city);
  return {
    title: `Best Car Dealerships in ${label} (2026) — Verified Reviews`,
    description: `Compare top-rated franchised car dealerships in ${label}. Read verified buyer reviews, trust scores, and dealer profiles on DealerVoice.`,
    alternates: { canonical: `/best-car-dealerships-in-${city}` },
  };
}

export default async function BestDealersInCityPage({ params }: Props) {
  const { city } = await params;
  const { dealers, cityLabel } = await getCityDealers(city);
  if (dealers.length === 0) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best car dealerships in ${cityLabel}`,
    itemListElement: dealers.slice(0, 10).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: `https://dealervoice.io/dealers/${stateSlug(d.stateCode, d.stateName)}/${citySlug(d.cityName)}/${d.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-muted">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-pearl text-foreground border-b border-border">
        <div className="container py-10">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">DealerVoice Rankings</p>
          <h1 className="text-3xl md:text-4xl font-bold">Best car dealerships in {cityLabel}</h1>
          <p className="text-foreground mt-3 max-w-2xl">
            Franchised dealerships ranked by trust score and verified reviews. Updated continuously.
          </p>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dealers.map((dealer, i) => (
            <div key={dealer.id} className="relative">
              {i < 3 && (
                <span className="absolute -top-2 -left-2 z-10 bg-primary/10 text-night-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  #{i + 1}
                </span>
              )}
              <DealerCard dealer={dealer as any} />
            </div>
          ))}
        </div>
        <p className="text-center mt-10 text-sm text-muted-foreground">
          <Link href={`/dealers/us`} className="text-primary hover:underline">
            Browse all US dealerships →
          </Link>
        </p>
      </div>
    </div>
  );
}
