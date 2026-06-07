import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscriptions</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["FREE", "PRO", "ENTERPRISE"] as const).map((plan) => (
          <div key={plan} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-500">{plan}</p>
            <p className="text-2xl font-bold text-gray-900">{byPlan[plan]}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Dealership</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/dealership/${s.dealership.slug}`} className="font-medium text-gold-800 hover:underline">
                    {s.dealership.name}
                  </Link>
                  <p className="text-xs text-gray-400">{s.dealership.cityName}</p>
                </td>
                <td className="px-4 py-3"><Badge>{s.plan}</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline">{s.status}</Badge></td>
                <td className="px-4 py-3 text-gray-500">
                  {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
