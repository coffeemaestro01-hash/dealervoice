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
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm" aria-labelledby="inventory-heading">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 id="inventory-heading" className="font-semibold text-foreground flex items-center gap-2">
          <Car size={18} className="text-primary" />
          Vehicles at {dealerName}
        </h2>
        {listings.length > 0 && (
          <span className="text-xs text-muted-foreground">{listings.length} listed</span>
        )}
      </div>

      {listings.length > 0 ? (
        <ul className="space-y-3">
          {listings.map((v) => (
            <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <Link href={`/vehicles/${v.id}`} className="group">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ")}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[v.condition, v.mileageKm != null ? `${v.mileageKm.toLocaleString()} km` : null, v.fuelType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {formatPrice(v.priceMinor, v.priceLabel, v.currency)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/vehicles/${v.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Details
                  </Button>
                </Link>
                {v.affiliateUrl && (
                  <a href={v.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="text-xs gap-1 px-2">
                      <ExternalLink size={12} />
                    </Button>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Live inventory available on the dealer&apos;s website.</p>
      )}

      {isPremium && inventoryUrl && (
        <a href={inventoryUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
          <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
            Browse full inventory <ExternalLink size={14} />
          </Button>
        </a>
      )}

      <p className="text-[10px] text-muted-foreground mt-3">
        Compare insurance before you buy —{" "}
        <Link href={`/dealers/${countryCode.toLowerCase()}`} className="text-primary hover:underline">
          more dealers in {countryCode}
        </Link>
      </p>
    </section>
  );
}
