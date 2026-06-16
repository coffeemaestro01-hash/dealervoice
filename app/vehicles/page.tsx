import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import prisma from "@/lib/db";
import { VehicleListingCard } from "@/components/vehicles/VehicleListingCard";
import { VehiclesFilterBar } from "@/components/vehicles/VehiclesFilterBar";
import { MARKET_LABELS } from "@/lib/geo/market";
import type { Prisma, VehicleCondition } from "@prisma/client";

export const metadata: Metadata = {
  title: "Browse Vehicles — Dealer Listings on DealerVoice",
  description:
    "Search cars listed by verified dealerships worldwide. Filter by region, make, and condition — then read dealer reviews before you buy.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{
    country?: string;
    make?: string;
    condition?: string;
    q?: string;
    page?: string;
  }>;
}

function buildWhere(params: {
  country?: string;
  make?: string;
  condition?: string;
  q?: string;
}): Prisma.VehicleListingWhereInput {
  const where: Prisma.VehicleListingWhereInput = { isActive: true };

  if (params.country) {
    where.countryCode = params.country.toUpperCase();
  }
  if (params.make) {
    where.make = { equals: params.make, mode: "insensitive" };
  }
  if (params.condition && ["NEW", "USED", "CERTIFIED"].includes(params.condition)) {
    where.condition = params.condition as VehicleCondition;
  }
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { trim: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function pageHref(params: Record<string, string | undefined>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "page") sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/vehicles?${qs}` : "/vehicles";
}

export default async function VehiclesBrowsePage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const where = buildWhere(sp);

  const [listings, total, makes] = await Promise.all([
    prisma.vehicleListing.findMany({
      where,
      orderBy: { listedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        dealership: {
          select: {
            name: true,
            slug: true,
            cityName: true,
            stateName: true,
            overallRating: true,
            totalReviews: true,
          },
        },
      },
    }),
    prisma.vehicleListing.count({ where }),
    prisma.vehicleListing.findMany({
      where: { isActive: true },
      distinct: ["make"],
      select: { make: true },
      orderBy: { make: "asc" },
      take: 40,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const regionLabel = sp.country ? (MARKET_LABELS[sp.country.toUpperCase()] ?? sp.country) : null;

  return (
    <div className="bg-card min-h-screen">
      <section className="border-b border-border bg-gradient-to-b from-muted to-background">
        <div className="container py-10 max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-2">
            <Car className="text-primary" size={32} />
            Browse vehicles
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Cars listed by dealerships on DealerVoice{regionLabel ? ` in ${regionLabel}` : " worldwide"}.
            Open a listing to see dealer trust scores and request a quote or test drive.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {total.toLocaleString()} vehicle{total === 1 ? "" : "s"} listed
          </p>
        </div>
      </section>

      <section className="py-8 container max-w-5xl">
        <Suspense fallback={<div className="h-16 rounded-xl bg-muted animate-pulse" />}>
          <VehiclesFilterBar makes={makes.map((m) => m.make)} />
        </Suspense>

        {listings.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border mt-8">
            <p className="text-foreground font-medium">No vehicles match your filters.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try a broader search or{" "}
              <Link href="/vehicles" className="text-primary hover:underline">
                view all listings
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {listings.map((v) => (
                <VehicleListingCard key={v.id} vehicle={v} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-4 mt-10" aria-label="Pagination">
                {page > 1 ? (
                  <Link
                    href={pageHref(sp, page - 1)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <ChevronLeft size={16} /> Previous
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Previous</span>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={pageHref(sp, page + 1)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Next</span>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
