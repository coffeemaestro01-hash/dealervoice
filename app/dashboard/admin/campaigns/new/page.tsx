import { requireAdminPage } from "@/lib/admin/require-admin-page";
import prisma from "@/lib/db";
import { AdminCreateCampaignForm } from "../AdminCreateCampaignForm";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  await requireAdminPage("/dashboard/admin/campaigns/new", "SUPER_ADMIN", "REVENUE");
  const countries = await prisma.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create campaign</h1>
      <AdminCreateCampaignForm countries={countries} />
    </div>
  );
}
