import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getGeoCoverage } from "@/lib/admin/stats";
import { getIndiaAdminStats } from "@/lib/admin/india-stats";
import { stateHref } from "@/lib/geo";

export const dynamic = "force-dynamic";

export default async function AdminGeoPage() {
  await requireAdminPage("/dashboard/admin/geo", "SUPER_ADMIN", "REVENUE");
  const [countries, india] = await Promise.all([getGeoCoverage(), getIndiaAdminStats()]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Geo coverage</h1>
        <p className="text-sm text-gray-500 mt-1">India-first density · global listings paused until soft launch.</p>
      </div>

      {india && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-lg">🇮🇳 India</h2>
              <p className="text-sm text-gray-500">
                {india.emails.toLocaleString()} emails · {india.districts} districts · {india.reviews} reviews
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gold-700">{india.dealerCount.toLocaleString()}</p>
              <Link href="/dealers/in" className="text-xs text-gold-600 hover:underline">Public hub →</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {india.states.map((s) => (
              <Link
                key={s.slug}
                href={stateHref("in", s.slug, s.name)!}
                className="text-xs bg-gray-50 hover:bg-gold-50 rounded-lg px-2 py-1.5 border border-gray-100"
              >
                <span className="line-clamp-1 font-medium text-gray-800">{s.name}</span>
                <span className="text-gray-400">{s.count}</span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Import more: <Link href="/dashboard/admin/import" className="text-gold-700 hover:underline">CSV import</Link>
            {" · "}
            Run <code className="bg-gray-100 px-1 rounded">npx tsx scripts/seed-dealers-india-osm.ts</code>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-gray-700">Global (existing data)</h2>
        {countries.filter((c) => c.code !== "IN").map((c) => (
          <div key={c.id} className="bg-white rounded-xl border p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{c.name}</h3>
              <span className="text-xl font-bold text-gray-700">{c.dealerCount}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.cities.map((city) => (
                <span key={city.id} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                  {city.name} ({city.dealerCount})
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
