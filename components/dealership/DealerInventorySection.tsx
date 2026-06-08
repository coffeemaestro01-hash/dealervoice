import Link from "next/link";
import prisma from "@/lib/db";
import { Car, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIncomeMinor } from "@/lib/income/ledger";

interface Props {
  dealershipId: string;
  dealerName: string;
  countryCode: string;
  inventoryUrl?: string | null;
  isPremium?: boolean;
}

function formatPrice(priceMinor: number | null, priceLabel: string | null, currency: string) {
  if (priceLabel) return priceLabel;
  if (priceMinor == null) return "Price on request";
  return formatIncomeMinor(priceMinor, currency);
}

export async function DealerInventorySection({
  dealershipId,
  dealerName,
  countryCode,
  inventoryUrl,
  isPremium = false,
}: Props) {
  const listings = await prisma.vehicleListing.findMany({
    where: { dealershipId, isActive: true },
    orderBy: { listedAt: "desc" },
    take: 6,
  });

  if (listings.length === 0 && !inventoryUrl) return null;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm" aria-labelledby="inventory-heading">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 id="inventory-heading" className="font-semibold text-gray-900 flex items-center gap-2">
          <Car size={18} className="text-gold-600" />
          Vehicles at {dealerName}
        </h2>
        {listings.length > 0 && (
          <span className="text-xs text-gray-500">{listings.length} listed</span>
        )}
      </div>

      {listings.length > 0 ? (
        <ul className="space-y-3">
          {listings.map((v) => (
            <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-50 p-3 hover:border-gold/30 transition-colors">
              <div>
                <p className="font-medium text-gray-900">
                  {[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[v.condition, v.mileageKm != null ? `${v.mileageKm.toLocaleString()} km` : null, v.fuelType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-sm font-semibold text-gold-800 mt-1">
                  {formatPrice(v.priceMinor, v.priceLabel, v.currency)}
                </p>
              </div>
              {v.affiliateUrl && (
                <a href={v.affiliateUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    View <ExternalLink size={12} />
                  </Button>
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">Live inventory available on the dealer&apos;s website.</p>
      )}

      {isPremium && inventoryUrl && (
        <a href={inventoryUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
          <Button className="w-full bg-gold-800 hover:bg-gold-900 gap-2">
            Browse full inventory <ExternalLink size={14} />
          </Button>
        </a>
      )}

      <p className="text-[10px] text-gray-400 mt-3">
        Compare insurance before you buy —{" "}
        <Link href={`/dealers/${countryCode.toLowerCase()}`} className="text-gold-700 hover:underline">
          more dealers in {countryCode}
        </Link>
      </p>
    </section>
  );
}
