import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { AdminMerchManager } from "./AdminMerchManager";

export const dynamic = "force-dynamic";

export default async function AdminMerchandisingPage() {
  await requireAdminPage("/dashboard/admin/merchandising", "SUPER_ADMIN", "REVENUE");

  const [pinned, dealers] = await Promise.all([
    prisma.dealership.findMany({
      where: { homepagePinOrder: { not: null }, deletedAt: null },
      orderBy: { homepagePinOrder: "asc" },
      select: { id: true, name: true, homepagePinOrder: true },
    }),
    prisma.dealership.findMany({
      where: { deletedAt: null },
      take: 100,
      orderBy: { totalReviews: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Homepage merchandising</h1>
      <p className="text-sm text-gray-500 mb-6">Pin dealers to the Trending section (lower number = higher position).</p>
      <AdminMerchManager dealers={dealers} pinned={pinned} />
    </div>
  );
}
