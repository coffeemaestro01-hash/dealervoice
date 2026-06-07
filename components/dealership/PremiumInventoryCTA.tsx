import Link from "next/link";
import { Car, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPremiumInventoryUrl } from "@/lib/dealer/premium";
import type { PremiumDealerFields } from "@/lib/dealer/premium";

interface Props {
  dealer: PremiumDealerFields & { name: string };
}

export function PremiumInventoryCTA({ dealer }: Props) {
  const inventoryUrl = getPremiumInventoryUrl(dealer);
  if (!inventoryUrl) return null;

  return (
    <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
            <Car size={20} className="text-gold-800" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-gold-900">Shop {dealer.name}&apos;s Inventory</p>
            <p className="text-sm text-gold-800/80">Premium verified dealer — browse live vehicles now.</p>
          </div>
        </div>
        <Link href={inventoryUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full sm:w-auto bg-gold-800 hover:bg-gold-900 gap-2">
            View Live Inventory
            <ExternalLink size={14} aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
}
