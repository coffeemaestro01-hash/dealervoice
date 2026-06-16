import Link from "next/link";
import prisma from "@/lib/db";
import { MapPin, Building2 } from "lucide-react";

async function getChicagoStats() {
  try {
    const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
    if (!us) return { dealerCount: 0, reviewCount: 0 };

    const [dealerCount, reviewCount] = await Promise.all([
      prisma.dealership.count({
        where: {
          countryId: us.id,
          deletedAt: null,
          OR: [
            { cityName: { contains: "Chicago", mode: "insensitive" } },
            { stateName: { contains: "Illinois", mode: "insensitive" } },
          ],
        },
      }),
      prisma.review.count({
        where: {
          status: "PUBLISHED",
          deletedAt: null,
          dealership: {
            countryId: us.id,
            OR: [
              { cityName: { contains: "Chicago", mode: "insensitive" } },
              { stateName: { contains: "Illinois", mode: "insensitive" } },
            ],
          },
        },
      }),
    ]);
    return { dealerCount, reviewCount };
  } catch {
    return { dealerCount: 0, reviewCount: 0 };
  }
}

export async function ChicagoCoverageSection() {
  const stats = await getChicagoStats();

  return (
    <section className="py-14 bg-background border-t border-border" aria-labelledby="chicago-coverage-heading">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Chicago · Illinois</p>
            <h2 id="chicago-coverage-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Local dealership coverage you can trust
            </h2>
            <p className="text-muted-foreground mt-2">
              DealerVoice is built in Chicago. Browse Illinois dealerships, read buyer reviews, and compare reputation before you visit the lot.
            </p>
          </div>
          <Link
            href="/chicago"
            className="inline-flex items-center gap-2 text-primary hover:text-primary font-semibold text-sm shrink-0"
          >
            Explore Chicago dealers →
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card border border-border shadow-soft p-5">
            <Building2 className="text-primary mb-2" size={22} />
            <p className="text-2xl font-bold text-foreground">{stats.dealerCount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Illinois dealerships listed</p>
          </div>
          <div className="rounded-xl border border-border bg-card border border-border shadow-soft p-5">
            <MapPin className="text-primary mb-2" size={22} />
            <p className="text-2xl font-bold text-foreground">Chicago metro</p>
            <p className="text-sm text-muted-foreground mt-1">Our home market — reviews growing daily</p>
          </div>
          <div className="rounded-xl border border-border bg-card border border-border shadow-soft p-5">
            <p className="text-2xl font-bold text-foreground">
              {stats.reviewCount > 0 ? stats.reviewCount.toLocaleString() : "Be first"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.reviewCount > 0 ? "Published Illinois reviews" : "Write the first local review"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/dealers/us" className="text-sm text-muted-foreground hover:text-primary">
            All U.S. dealers →
          </Link>
          <Link href="/write-review" className="text-sm text-muted-foreground hover:text-primary">
            Write a review →
          </Link>
        </div>
      </div>
    </section>
  );
}
