import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getAdRevenueStats } from "@/lib/ads/placements";
import { resolveAdHref } from "@/lib/ads/affiliate";
import prisma from "@/lib/db";
import Link from "next/link";
import { AdminAdPlacementEditor } from "@/components/admin/AdminAdPlacementEditor";
import { AdmitadConnectionPanel } from "@/components/admin/AdmitadConnectionPanel";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdminPage("/dashboard/admin/ads", "SUPER_ADMIN", "REVENUE");
  const [stats, placements] = await Promise.all([
    getAdRevenueStats(30),
    prisma.adPlacement.findMany({ orderBy: [{ slot: "asc" }, { priority: "desc" }] }),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ad revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">Live affiliate & sponsored placements — clicks, impressions, estimated CPC revenue.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Clicks (30d)" value={stats.clicks30d} />
        <Stat label="Impressions (30d)" value={stats.impressions30d} />
        <Stat label="CTR" value={`${stats.ctr}%`} />
        <Stat label="Est. affiliate revenue" value={`$${stats.estimatedRevenue.toLocaleString("en-US")}`} />
      </div>

      <AdmitadConnectionPanel />

      <div>
        <h2 className="font-semibold text-foreground mb-4">Edit placements & affiliate IDs</h2>
        <AdminAdPlacementEditor
          placements={placements.map((p) => ({
            ...p,
            affiliateRef: p.affiliateRef ?? null,
            affiliateParam: p.affiliateParam ?? null,
            resolvedHref: resolveAdHref(p.ctaHref, p.affiliateRef, p.affiliateParam),
          }))}
        />
        <p className="text-xs text-muted-foreground mt-4">
          Sponsored dealers: <Link href="/dashboard/admin/sponsors" className="text-primary hover:underline">Sponsors</Link>
          {" · "}
          <a href="mailto:advertise@dealervoice.io" className="text-primary hover:underline">advertise@dealervoice.io</a>
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}
