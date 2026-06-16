import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getDataQualityStats } from "@/lib/admin/stats";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDataQualityPage() {
  await requireAdminPage("/dashboard/admin/data-quality", "SUPER_ADMIN", "REVENUE", "SUPPORT");
  const stats = await getDataQualityStats();

  const issues = [
    { label: "No reviews", value: stats.noReviews, pct: Math.round((stats.noReviews / stats.total) * 100) },
    { label: "No phone", value: stats.noPhone, pct: Math.round((stats.noPhone / stats.total) * 100) },
    { label: "No website", value: stats.noWebsite, pct: Math.round((stats.noWebsite / stats.total) * 100) },
    { label: "No email", value: stats.noEmail, pct: Math.round((stats.noEmail / stats.total) * 100) },
    { label: "Unclaimed", value: stats.unclaimed, pct: Math.round((stats.unclaimed / stats.total) * 100) },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">Data quality</h1>
      <p className="text-sm text-muted-foreground mb-6">{stats.total.toLocaleString()} public dealers · gaps to fix before SEO scale.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {issues.map((i) => (
          <div key={i.label} className="bg-card rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">{i.label}</p>
            <p className="text-2xl font-bold">{i.value.toLocaleString()}</p>
            <p className="text-xs text-primary">{i.pct}% of listings</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/dashboard/admin/review-seeding" className="text-primary hover:underline">
          Review seeding (first 10 IL) →
        </Link>
        <Link href="/dashboard/admin/outreach" className="text-primary hover:underline">
          Outreach queue (phone, no email) →
        </Link>
        <Link href="/dashboard/admin/campaigns" className="text-primary hover:underline">
          Email campaigns (has email) →
        </Link>
      </div>
    </div>
  );
}
