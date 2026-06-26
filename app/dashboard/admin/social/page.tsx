import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { AdminLinkedInSocial } from "@/components/admin/AdminLinkedInSocial";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminSocialLinkedInPage() {
  await requireAdminPage("/dashboard/admin/social", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">LinkedIn growth autopilot</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unique posts every 3 hours on{" "}
          <a href="https://www.linkedin.com/company/dealervoice/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            linkedin.com/company/dealervoice
          </a>
          . Images auto-generated; videos via template URLs in{" "}
          <code className="text-xs">lib/social/linkedin/content.ts</code>.
        </p>
        <Link href="/dashboard/admin/revenue" className="text-sm text-primary hover:underline mt-2 inline-block">
          ← Revenue command center
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <AdminLinkedInSocial />
      </Suspense>
    </div>
  );
}
