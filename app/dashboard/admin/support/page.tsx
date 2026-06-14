import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminSupportPage } from "@/components/admin/AdminSupportPage";

export const dynamic = "force-dynamic";

export default async function AdminSupportRoute() {
  await requireAdminPage("/dashboard/admin/support", "SUPER_ADMIN", "SUPPORT", "REVENUE");
  return <AdminSupportPage />;
}
