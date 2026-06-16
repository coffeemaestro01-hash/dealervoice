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
    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Car size={20} className="text-primary" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-foreground">Shop {dealer.name}&apos;s Inventory</p>
            <p className="text-sm text-primary/80">Premium verified dealer — browse live vehicles now.</p>
          </div>
        </div>
        <Link href={inventoryUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2">
            View Live Inventory
            <ExternalLink size={14} aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
}
