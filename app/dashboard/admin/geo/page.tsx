import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { getGeoCoverage } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

export default async function AdminGeoPage() {
  await requireAdminPage("/dashboard/admin/geo", "SUPER_ADMIN", "REVENUE");
  const countries = await getGeoCoverage();
  const us = countries.find((c) => c.code === "US");
  const others = countries.filter((c) => c.code !== "US");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Geo coverage</h1>
        <p className="text-sm text-muted-foreground mt-1">Chicago / Illinois primary · U.S. expansion · global listings for browse-only.</p>
      </div>

      {us && (
        <div className="bg-card rounded-xl border p-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-lg">🇺🇸 United States</h2>
              <p className="text-sm text-muted-foreground">Primary GTM market — Chicago metro and nationwide</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{us.dealerCount.toLocaleString()}</p>
              <Link href="/chicago" className="text-xs text-primary hover:underline">Chicago hub →</Link>
              {" · "}
              <Link href="/dealers/us" className="text-xs text-primary hover:underline">Public hub →</Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {us.cities.map((city) => (
              <span key={city.id} className="text-xs bg-muted rounded-full px-2 py-1 border border-border">
                {city.name} ({city.dealerCount})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">Other markets (browse-only)</h2>
        {others.map((c) => (
          <div key={c.id} className="bg-card rounded-xl border p-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{c.name}</h3>
              <span className="text-xl font-bold text-foreground">{c.dealerCount}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.cities.map((city) => (
                <span key={city.id} className="text-xs bg-muted rounded-full px-2 py-1">
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
