import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getIncomeDashboard } from "@/lib/income/ledger";
import { AdminIncomeDashboard } from "@/components/admin/AdminIncomeDashboard";
import { REVENUE_STREAM_GUIDE } from "@/lib/launch/phases";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminIncomePage() {
  await requireAdminPage("/dashboard/admin/income", "SUPER_ADMIN");
  const stats = await getIncomeDashboard(30);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform income</h1>
          <p className="text-sm text-gray-500 mt-1">
            Unified ledger — subscriptions, affiliates, AdSense, sponsorship, leads. SUPER_ADMIN only.
          </p>
        </div>
        <Link href="/dashboard/admin/launch" className="text-sm text-gold-700 hover:underline font-medium">
          Launch tracker →
        </Link>
      </div>

      <AdminIncomeDashboard initial={stats} />

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Where money comes from</h2>
        <div className="space-y-4">
          {REVENUE_STREAM_GUIDE.map((row) => (
            <div key={row.stream} className="border-b border-gray-50 pb-4 last:border-0">
              <p className="font-medium text-gray-900">{row.stream}</p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Who pays:</strong> {row.whoPays} · <strong>Typical:</strong> {row.howMuch}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <strong>Tracked as:</strong> {row.tracking}
              </p>
              <p className="text-xs text-gold-800 mt-1">
                <strong>Your action:</strong> {row.yourAction}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
