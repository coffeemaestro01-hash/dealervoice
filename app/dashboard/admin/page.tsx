import prisma from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import { Users, Store, MessageSquare, Flag, DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [users, dealers, reviews, pendingReports, pendingClaims, revenue, drip] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.dealership.count({ where: { deletedAt: null } }),
    prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.dealerClaim.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    import("@/lib/outreach/discover-emails").then((m) => m.getOutreachDripStats()),
  ]);
  return {
    users,
    dealers,
    reviews,
    pendingReports,
    pendingClaims,
    revenue: (revenue._sum.amount ?? 0) / 100,
    drip,
  };
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
  let stats: Awaited<ReturnType<typeof getAdminStats>> = {
    users: 0,
    dealers: 0,
    reviews: 0,
    pendingReports: 0,
    pendingClaims: 0,
    revenue: 0,
    drip: { withEmail: 0, dripActive: 0, dripComplete: 0, notStarted: 0, illinoisWithEmail: 0 },
  };
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = { recentReviews: [], recentUsers: [], recentClaims: [] };

  try {
    [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity()]);
  } catch {
    // DB not yet migrated
  }

  const statCards = [
    { label: "Total Users", value: formatNumber(stats.users), icon: Users, color: "text-primary bg-primary/10" },
    { label: "Dealerships", value: formatNumber(stats.dealers), icon: Store, color: "text-muted-foreground bg-muted" },
    { label: "Reviews", value: formatNumber(stats.reviews), icon: MessageSquare, color: "text-primary bg-muted" },
    { label: "Pending Reports", value: stats.pendingReports, icon: Flag, color: "text-destructive bg-destructive/10" },
    { label: "Pending Claims", value: stats.pendingClaims, icon: TrendingUp, color: "text-primary bg-primary/10" },
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <a href="/dashboard/admin/analytics" className="text-sm font-semibold text-primary hover:underline">
          Site analytics →
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-foreground">Outreach drip (US · Chicago focus)</h2>
          <a href="/dashboard/admin/outreach" className="text-sm text-primary hover:underline">Open queue →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div><p className="text-2xl font-bold">{stats.drip.illinoisWithEmail}</p><p className="text-xs text-muted-foreground">IL w/ email</p></div>
          <div><p className="text-2xl font-bold">{stats.drip.notStarted}</p><p className="text-xs text-muted-foreground">Ready for drip</p></div>
          <div><p className="text-2xl font-bold">{stats.drip.dripActive}</p><p className="text-xs text-muted-foreground">Active drips</p></div>
          <div><p className="text-2xl font-bold">{stats.drip.dripComplete}</p><p className="text-xs text-muted-foreground">Drip complete</p></div>
          <div><p className="text-2xl font-bold">{stats.drip.withEmail}</p><p className="text-xs text-muted-foreground">US w/ email</p></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent reviews */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {activity.recentReviews.map((r) => (
              <div key={r.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.dealership.name}</p>
                  <p className="text-xs text-muted-foreground">by {r.author.name} · {r.status}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "PUBLISHED" ? "bg-muted text-primary" : r.status === "FLAGGED" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending claims */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Pending Claims</h2>
            <a href="/dashboard/admin/claims" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {activity.recentClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending claims</p>
            ) : (
              activity.recentClaims.map((c) => (
                <div key={c.id} className="py-2 border-b border-border last:border-0">
                  <p className="text-sm font-medium text-foreground">{c.dealership.name}</p>
                  <p className="text-xs text-muted-foreground">by {c.submittedBy.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
