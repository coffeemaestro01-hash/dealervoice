import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { AdminFeaturedBadgesTable } from "@/components/admin/AdminFeaturedBadgesTable";
import { PAID_PLANS } from "@/lib/dealer/featured-badge";
import type { PaidPlan } from "@/lib/dealer/featured-badge";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedBadgesPage() {
  await requireAdminPage("/dashboard/admin/featured-badges", "SUPER_ADMIN", "REVENUE");

  const raw = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      OR: [{ status: "CLAIMED" }, { isPremiumClaimed: true }, { claimedAt: { not: null } }],
      subscription: {
        plan: { in: [...PAID_PLANS] },
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    },
    orderBy: [{ subscription: { plan: "desc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      cityName: true,
      status: true,
      featuredBadgeEnabled: true,
      subscription: { select: { plan: true, status: true } },
    },
  });

  const dealers = raw
    .filter((d) => d.subscription && PAID_PLANS.includes(d.subscription.plan as PaidPlan))
    .map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      cityName: d.cityName,
      status: d.status,
      featuredBadgeEnabled: d.featuredBadgeEnabled,
      plan: d.subscription!.plan as PaidPlan,
      subscriptionStatus: d.subscription!.status,
    }));

  const enabled = dealers.filter((d) => d.featuredBadgeEnabled).length;
  const byPlan = {
    PRO: dealers.filter((d) => d.plan === "PRO").length,
    PRO_PLUS: dealers.filter((d) => d.plan === "PRO_PLUS").length,
    ENTERPRISE: dealers.filter((d) => d.plan === "ENTERPRISE").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-start gap-3 mb-6">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
          <Award size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Featured badges</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Claimed, paying dealers on Pro, Pro+, or Enterprise. Toggle visibility or preview embed codes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">Eligible</p>
          <p className="text-2xl font-bold text-foreground">{dealers.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">Visible</p>
          <p className="text-2xl font-bold text-primary">{enabled}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">Pro / Pro+</p>
          <p className="text-2xl font-bold text-foreground">{byPlan.PRO + byPlan.PRO_PLUS}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">Enterprise</p>
          <p className="text-2xl font-bold text-foreground">{byPlan.ENTERPRISE}</p>
        </div>
      </div>

      <AdminFeaturedBadgesTable dealers={dealers} />

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/dashboard/admin/subscriptions" className="text-primary hover:underline">
          Subscriptions →
        </Link>
        <Link href="/dashboard/dealer/billing" className="text-primary hover:underline">
          Dealer billing page →
        </Link>
      </div>
    </div>
  );
}
