import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminPromotionsManager } from "@/components/admin/AdminPromotionsManager";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  await requireAdminPage("/dashboard/admin/promotions", "SUPER_ADMIN");

  return (
    <div className="p-6 lg:p-8">
      <AdminPromotionsManager />
    </div>
  );
}
