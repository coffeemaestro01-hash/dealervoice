import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getRevenueStats } from "@/lib/admin/stats";
import { getAdRevenueStats } from "@/lib/ads/placements";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  await requireAdminPage("/dashboard/admin/revenue", "SUPER_ADMIN", "REVENUE");
  const [stats, adStats] = await Promise.all([getRevenueStats(), getAdRevenueStats(30)]);

  const funnel = [
    { label: "Claims pending", value: stats.claimsPending, href: "/dashboard/admin/claims" },
    { label: "Claims approved (30d)", value: stats.claimsApproved30d, href: "/dashboard/admin/claims" },
    { label: "Dealers claimed", value: stats.claimedDealers, href: "/dashboard/admin/dealerships?status=CLAIMED" },
    { label: "Premium / paid", value: stats.premiumDealers, href: "/dashboard/admin/subscriptions" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue command center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          MRR estimate, paid revenue, and claim → pay funnel.{" "}
          <Link href="/dashboard/admin/income" className="text-primary hover:underline">
            Full income ledger (SUPER_ADMIN) →
          </Link>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Total paid revenue" value={`$${stats.totalRevenue.toLocaleString("en-US")}`} />
        <Stat label="MRR estimate" value={`$${stats.mrrEstimate.toLocaleString("en-US")}`} />
        <Stat label="Pro plans" value={stats.proCount} />
        <Stat label="Pro+ plans" value={stats.proPlusCount} />
        <Stat label="Enterprise" value={stats.enterpriseCount} />
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold text-foreground mb-4">Claim → pay funnel</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {funnel.map((step, i) => (
            <Link key={step.label} href={step.href} className="text-center p-4 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
              <p className="text-2xl font-bold text-foreground">{step.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.label}</p>
              {i < funnel.length - 1 && (
                <p className="text-[10px] text-primary mt-2">
                  {i === 2 ? `${stats.claimToPayRate}% claim→pay` : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Stat label="Leads (30d)" value={stats.leads30d} />
        <Stat label="Lead conversion" value={`${stats.leadConversionRate}%`} />
      </div>

      <div className="bg-card rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-foreground">Affiliate ad revenue (30d)</h2>
          <Link href="/dashboard/admin/ads" className="text-sm text-primary hover:underline">Full report →</Link>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          <Stat label="Ad clicks" value={adStats.clicks30d} />
          <Stat label="Impressions" value={adStats.impressions30d} />
          <Stat label="CTR" value={`${adStats.ctr}%`} />
          <Stat label="Est. CPC revenue" value={`$${adStats.estimatedRevenue.toLocaleString("en-US")}`} />
        </div>
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
