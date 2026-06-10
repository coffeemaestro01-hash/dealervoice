import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminCampaignsDashboard } from "@/components/admin/AdminCampaignsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  await requireAdminPage("/dashboard/admin/campaigns", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8">
      <AdminCampaignsDashboard />
    </div>
  );
}
