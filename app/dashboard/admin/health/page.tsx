import { requireAdminPage } from "@/lib/admin/require-admin-page";

export const dynamic = "force-dynamic";

async function getHealth() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  try {
    const res = await fetch(`${base}/api/health`, { cache: "no-store" });
    return res.json();
  } catch {
    return { status: "unknown", checks: {} };
  }
}

export default async function AdminHealthPage() {
  await requireAdminPage("/dashboard/admin/health", "SUPER_ADMIN");
  const health = await getHealth();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">System health</h1>
      <div className="bg-card rounded-xl border p-6 max-w-lg">
        <p className="text-lg font-semibold mb-4">
          Status:{" "}
          <span className={health.status === "healthy" ? "text-primary" : "text-primary"}>
            {health.status}
          </span>
        </p>
        <ul className="space-y-2 text-sm">
          {Object.entries(health.checks || {}).map(([k, v]) => (
            <li key={k} className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono">{String(v)}</span>
            </li>
          ))}
        </ul>
        {health.timestamp && (
          <p className="text-xs text-muted-foreground mt-4">Checked {new Date(health.timestamp).toLocaleString()}</p>
        )}
      </div>
      <ul className="mt-6 text-sm text-muted-foreground space-y-1">
        <li>Resend: verify domain at resend.com/domains</li>
        <li>Supabase: storage bucket dealer-assets</li>
        <li>Stripe: webhooks logged in Payments</li>
        <li>Crons: reputation (03:00 UTC), geo (04:00), discover-emails (Tue 06:00), digest (Mon 08:00), outreach-drip (10:00)</li>
      </ul>
    </div>
  );
}
