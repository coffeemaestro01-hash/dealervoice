import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getBusinessCommandCenterData } from "@/lib/admin/business-tracking";
import { AdminCommandCenterPanel } from "@/components/admin/AdminCommandCenterPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCommandCenterPage() {
  await requireAdminPage("/dashboard/admin/command-center", "SUPER_ADMIN");
  const data = await getBusinessCommandCenterData();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Business command center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue, outreach, gift cards, and automation runs — everything trackable in one place.{" "}
          <Link href="/dashboard/admin/revenue" className="text-primary hover:underline">
            Revenue detail →
          </Link>
          {" · "}
          <Link href="/dashboard/admin/launch" className="text-primary hover:underline">
            Launch tracker →
          </Link>
        </p>
      </div>

      <AdminCommandCenterPanel data={data} />
    </div>
  );
}
