import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminOutreachQueue } from "@/components/admin/AdminOutreachQueue";

export const dynamic = "force-dynamic";

export default async function AdminOutreachPage() {
  await requireAdminPage("/dashboard/admin/outreach", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Outreach contact queue</h1>
      <p className="text-sm text-gray-500 mb-6">
        India unclaimed dealers with phone but no email — claim templates, WhatsApp, and phone scripts. Send from {`dealers@dealervoice.io`}.
      </p>
      <AdminOutreachQueue />
    </div>
  );
}
