import prisma from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import { Users, Store, MessageSquare, Flag, DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [users, dealers, reviews, pendingReports, pendingClaims, revenue] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.dealership.count({ where: { deletedAt: null } }),
    prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.dealerClaim.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
  ]);
  return { users, dealers, reviews, pendingReports, pendingClaims, revenue: (revenue._sum.amount ?? 0) / 100 };
}

async function getRecentActivity() {
  const [recentReviews, recentUsers, recentClaims] = await Promise.all([
    prisma.review.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        dealership: { select: { name: true, slug: true } },
      },
    }),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.dealerClaim.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { dealership: { select: { name: true } }, submittedBy: { select: { name: true } } },
    }),
  ]);
  return { recentReviews, recentUsers, recentClaims };
}

export default async function AdminOverviewPage() {
  let stats: Awaited<ReturnType<typeof getAdminStats>> = { users: 0, dealers: 0, reviews: 0, pendingReports: 0, pendingClaims: 0, revenue: 0 };
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = { recentReviews: [], recentUsers: [], recentClaims: [] };

  try {
    [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity()]);
  } catch {
    // DB not yet migrated
  }

  const statCards = [
    { label: "Total Users", value: formatNumber(stats.users), icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Dealerships", value: formatNumber(stats.dealers), icon: Store, color: "text-purple-600 bg-purple-50" },
    { label: "Reviews", value: formatNumber(stats.reviews), icon: MessageSquare, color: "text-green-600 bg-green-50" },
    { label: "Pending Reports", value: stats.pendingReports, icon: Flag, color: "text-red-600 bg-red-50" },
    { label: "Pending Claims", value: stats.pendingClaims, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent reviews */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {activity.recentReviews.map((r) => (
              <div key={r.id} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.dealership.name}</p>
                  <p className="text-xs text-gray-500">by {r.author.name} · {r.status}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "PUBLISHED" ? "bg-green-50 text-green-700" : r.status === "FLAGGED" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending claims */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Claims</h2>
            <a href="/dashboard/admin/dealerships?tab=claims" className="text-xs text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {activity.recentClaims.length === 0 ? (
              <p className="text-sm text-gray-500">No pending claims</p>
            ) : (
              activity.recentClaims.map((c) => (
                <div key={c.id} className="py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{c.dealership.name}</p>
                  <p className="text-xs text-gray-500">by {c.submittedBy.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
