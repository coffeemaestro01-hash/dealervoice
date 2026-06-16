import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { usStateWhere } from "@/lib/outreach/regions";
import { AdminReviewSeedingTable } from "@/components/admin/AdminReviewSeedingTable";
import { PenLine } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewSeedingPage() {
  await requireAdminPage("/dashboard/admin/review-seeding", "SUPER_ADMIN", "REVENUE", "MODERATOR");

  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });

  const dealers = us
    ? await prisma.dealership.findMany({
        where: {
          countryId: us.id,
          deletedAt: null,
          totalReviews: 0,
          ...usStateWhere("Illinois"),
        },
        orderBy: [{ isFranchised: "desc" }, { cityName: "asc" }, { name: "asc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          cityName: true,
          stateName: true,
          isFranchised: true,
        },
      })
    : [];

  const published = await prisma.review.count({ where: { status: "PUBLISHED" } });

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start gap-3 mb-6">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
          <PenLine size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review seeding — first 10</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Illinois dealers with <strong>zero reviews</strong>. Use <strong>Seed review link</strong> yourself or
            send to friends who visited the store. Use <strong>Customer link</strong> / QR for dealers to share after
            sales.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Published reviews site-wide: <strong className="text-foreground">{published}</strong> · Goal:{" "}
            <strong className="text-foreground">10</strong>
          </p>
        </div>
      </div>

      <AdminReviewSeedingTable dealers={dealers} />

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/write-review" className="text-primary hover:underline">
          Public write-review page →
        </Link>
        <Link href="/dashboard/admin/outreach" className="text-primary hover:underline">
          Outreach queue →
        </Link>
        <Link href="/chicago" className="text-primary hover:underline">
          Chicago landing →
        </Link>
      </div>
    </div>
  );
}
