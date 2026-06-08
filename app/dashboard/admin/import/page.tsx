import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminDealerImport } from "@/components/admin/AdminDealerImport";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  await requireAdminPage("/dashboard/admin/import", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Import dealerships</h1>
      <p className="text-sm text-gray-500 mb-6">
        Bulk CSV import for India listings. Required columns: name, state, city. Optional: district, phone, website, email, address.
      </p>
      <AdminDealerImport />
    </div>
  );
}
