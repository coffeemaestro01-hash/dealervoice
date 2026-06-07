import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getRevenueStats } from "@/lib/admin/stats";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  await requireAdminPage("/dashboard/admin/revenue", "SUPER_ADMIN", "REVENUE");
  const stats = await getRevenueStats();

  const funnel = [
    { label: "Claims pending", value: stats.claimsPending, href: "/dashboard/admin/claims" },
    { label: "Claims approved (30d)", value: stats.claimsApproved30d, href: "/dashboard/admin/claims" },
    { label: "Dealers claimed", value: stats.claimedDealers, href: "/dashboard/admin/dealerships?status=CLAIMED" },
    { label: "Premium / paid", value: stats.premiumDealers, href: "/dashboard/admin/subscriptions" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue command center</h1>
        <p className="text-sm text-gray-500 mt-1">MRR estimate, paid revenue, and claim → pay funnel.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total paid revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
        <Stat label="MRR estimate" value={`₹${stats.mrrEstimate.toLocaleString()}`} />
        <Stat label="Pro plans" value={stats.proCount} />
        <Stat label="Enterprise" value={stats.enterpriseCount} />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Claim → pay funnel</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {funnel.map((step, i) => (
            <Link key={step.label} href={step.href} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gold-50 transition-colors">
              <p className="text-2xl font-bold text-gray-900">{step.value}</p>
              <p className="text-xs text-gray-500 mt-1">{step.label}</p>
              {i < funnel.length - 1 && (
                <p className="text-[10px] text-gold-600 mt-2">
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
