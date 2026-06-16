import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { TEAM_MATRIX } from "@/lib/admin/permissions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  await requireAdminPage("/dashboard/admin/team", "SUPER_ADMIN");

  const roles = [
    { role: "SUPER_ADMIN", desc: "Full access — settings, health, audit, all teams" },
    { role: "REVENUE", desc: "Revenue, subscriptions, sponsors, payments, campaigns, geo" },
    { role: "SUPPORT", desc: "Leads, claims, inbox, dealerships, data quality" },
    { role: "MODERATOR", desc: "Reviews, users, DSR, moderation" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team & roles</h1>
        <p className="text-sm text-muted-foreground mt-1">Prime team split for DealerVoice.io operations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {TEAM_MATRIX.map((t) => (
          <div key={t.team} className="bg-card rounded-xl border p-5">
            <h2 className="font-semibold text-foreground">{t.team}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t.areas}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-semibold mb-3">Staff roles</h2>
        <div className="bg-card rounded-xl border divide-y">
          {roles.map((r) => (
            <div key={r.role} className="px-4 py-3 flex gap-3">
              <Badge variant="outline">{r.role}</Badge>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm">
        Assign roles in{" "}
        <Link href="/dashboard/admin/users" className="text-primary hover:underline">
          Users → Manage → Change role
        </Link>
        . Create staff accounts with @dealervoice.io emails, then promote from Customer.
      </p>
    </div>
  );
}
