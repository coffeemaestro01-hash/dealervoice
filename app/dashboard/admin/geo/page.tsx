import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getGeoCoverage } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export default async function AdminGeoPage() {
  await requireAdminPage("/dashboard/admin/geo", "SUPER_ADMIN", "REVENUE");
  const countries = await getGeoCoverage();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Geo coverage</h1>
      <div className="space-y-4">
        {countries.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border p-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">{c.name}</h2>
              <span className="text-2xl font-bold text-gold-700">{c.dealerCount}</span>
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
