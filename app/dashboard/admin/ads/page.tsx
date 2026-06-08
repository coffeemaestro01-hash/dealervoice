import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getAdRevenueStats } from "@/lib/ads/placements";
import prisma from "@/lib/db";
import Link from "next/link";

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
        <h1 className="text-2xl font-bold text-gray-900">Ad revenue</h1>
        <p className="text-sm text-gray-500 mt-1">Live affiliate & sponsored placements — clicks, impressions, estimated CPC revenue.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Clicks (30d)" value={stats.clicks30d} />
        <Stat label="Impressions (30d)" value={stats.impressions30d} />
        <Stat label="CTR" value={`${stats.ctr}%`} />
        <Stat label="Est. affiliate revenue" value={`₹${stats.estimatedRevenue.toLocaleString()}`} />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Active placements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Slot</th>
                <th className="pb-2 pr-4">Headline</th>
                <th className="pb-2 pr-4">Market</th>
                <th className="pb-2 pr-4">CPC est.</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs">{p.slot}</td>
                  <td className="py-3 pr-4">{p.headline}</td>
                  <td className="py-3 pr-4">{p.countryCode ?? "Global"}</td>
                  <td className="py-3 pr-4">{p.cpcEstimatePaise ? `₹${(p.cpcEstimatePaise / 100).toFixed(0)}` : "—"}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? "Live" : "Paused"}
                    </span>
                  </td>
                </tr>
              ))}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No placements yet. Run <code className="text-xs bg-gray-100 px-1 rounded">npx tsx scripts/seed-ad-placements.ts</code>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Manage sponsored dealers at <Link href="/dashboard/admin/sponsors" className="text-gold-700 hover:underline">Sponsors</Link>.
          Direct ad sales: <a href="mailto:advertise@dealervoice.io" className="text-gold-700 hover:underline">advertise@dealervoice.io</a>
        </p>
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
