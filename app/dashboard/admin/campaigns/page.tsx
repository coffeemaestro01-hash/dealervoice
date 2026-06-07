import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { AdminCampaignForm } from "./AdminCampaignForm";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  await requireAdminPage("/dashboard/admin/campaigns", "SUPER_ADMIN", "REVENUE");
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Outbound campaigns</h1>
      <p className="text-sm text-gray-500 mb-6">Email unclaimed dealers to drive claims. Max 50 per send.</p>
      <AdminCampaignForm countries={countries} />
    </div>
  );
}
