import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminOutreachQueue } from "@/components/admin/AdminOutreachQueue";

export const dynamic = "force-dynamic";

export default async function AdminOutreachPage() {
  await requireAdminPage("/dashboard/admin/outreach", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Outreach contact queue</h1>
      <p className="text-sm text-muted-foreground mb-6">
        US-first dealer outreach — automated 3-email drip for dealers with email, or phone/WhatsApp templates for manual contact. Sends from {`dealers@dealervoice.io`}.
      </p>
      <AdminOutreachQueue />
    </div>
  );
}
