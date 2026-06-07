import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AdminSponsorManager } from "./AdminSponsorManager";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdminPage("/dashboard/admin/sponsors", "SUPER_ADMIN", "REVENUE");

  const [sponsors, dealers] = await Promise.all([
    prisma.dealership.findMany({
      where: { isSponsored: true, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true, sponsorLabel: true, sponsoredUntil: true, cityName: true },
    }),
    prisma.dealership.findMany({
      where: { deletedAt: null, status: { in: ["ACTIVE", "CLAIMED"] } },
      take: 100,
      orderBy: { totalReviews: "desc" },
      select: { id: true, name: true, slug: true, cityName: true },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sponsored placements</h1>
      <AdminSponsorManager dealers={dealers} />
      <div className="bg-white rounded-xl border divide-y">
        {sponsors.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No active sponsors.</p>
        ) : (
          sponsors.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <Link href={`/dealership/${s.slug}`} className="font-medium text-gold-800 hover:underline">{s.name}</Link>
                <p className="text-xs text-gray-400">{s.cityName}</p>
              </div>
              <div className="text-right">
                <Badge>{s.sponsorLabel ?? "Sponsored"}</Badge>
                {s.sponsoredUntil && (
                  <p className="text-xs text-gray-400 mt-1">Until {new Date(s.sponsoredUntil).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
