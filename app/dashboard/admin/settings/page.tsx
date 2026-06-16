import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminSettingsForm } from "./AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage("/dashboard/admin/settings", "SUPER_ADMIN");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Platform settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Feature flags and global toggles. Changes apply immediately.</p>
      <AdminSettingsForm />
      <p className="text-xs text-muted-foreground mt-4">
        Slack: set SLACK_WEBHOOK_URL in Vercel for alert delivery when SLACK_ALERTS_ENABLED is on.
      </p>
    </div>
  );
}
