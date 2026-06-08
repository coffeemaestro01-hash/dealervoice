import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdminPage("/dashboard/admin/analytics", "SUPER_ADMIN");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site analytics command center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Super admin only. Tracks all public and authenticated page hits across dealervoice.io.
        </p>
      </div>
      <AdminAnalyticsDashboard />
    </div>
  );
}
