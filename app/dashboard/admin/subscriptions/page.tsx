import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminSubscriptionActions } from "./AdminSubscriptionActions";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const subs = await prisma.dealerSubscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      dealership: { select: { name: true, slug: true, cityName: true } },
    },
  });

  const byPlan = {
    FREE: subs.filter((s) => s.plan === "FREE").length,
    PRO: subs.filter((s) => s.plan === "PRO").length,
    ENTERPRISE: subs.filter((s) => s.plan === "ENTERPRISE").length,
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Subscriptions</h1>
      <p className="text-sm text-muted-foreground mb-6">Manually upgrade, downgrade, or cancel dealer plans.</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["FREE", "PRO", "ENTERPRISE"] as const).map((plan) => (
          <div key={plan} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">{plan}</p>
            <p className="text-2xl font-bold text-foreground">{byPlan[plan]}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Dealership</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renews</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-muted">
                <td className="px-4 py-3">
                  <Link href={`/dealership/${s.dealership.slug}`} className="font-medium text-primary hover:underline">
                    {s.dealership.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{s.dealership.cityName}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge>{s.plan}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{s.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <AdminSubscriptionActions id={s.id} plan={s.plan} status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
