import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDealerPremiumClaimed } from "@/lib/dealer/premium";

interface Props {
  dealershipId: string;
  dealerName: string;
  isPremiumClaimed?: boolean;
  subscription?: { plan: string } | null;
  showUpgradeQuery?: boolean;
}

export function PremiumUpgradeBanner({
  dealershipId,
  dealerName,
  isPremiumClaimed,
  subscription,
  showUpgradeQuery,
}: Props) {
  if (isDealerPremiumClaimed({ isPremiumClaimed, subscription })) return null;

  const billingHref = `/dashboard/dealer/billing?dealer=${dealershipId}${showUpgradeQuery ? "&upgrade=1" : ""}`;

  return (
    <div className="mb-6 rounded-2xl border-2 border-gold/40 bg-gradient-to-r from-night to-night-800 p-5 md:p-6 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <Sparkles className="text-gold-400" size={22} aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-1">Remove competitor ads</p>
            <h2 className="text-lg font-bold">Upgrade {dealerName} to Pro</h2>
            <p className="text-sm text-gray-400 mt-1 max-w-lg">
              Strip sponsored alternatives from your profile, add a live inventory link, and unlock analytics + AI review responses.
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
              <li className="flex items-center gap-1"><X size={12} className="text-gold-500" /> No competitor ads</li>
              <li className="flex items-center gap-1"><X size={12} className="text-gold-500" /> Live inventory CTA</li>
              <li>Lead notifications</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link href={billingHref}>
            <Button className="w-full sm:w-auto bg-gold-gradient text-night-900 font-bold hover:opacity-90 border-0">
              Upgrade to Pro
            </Button>
          </Link>
          <Link href={`/pricing?dealer=${dealershipId}`}>
            <Button variant="outline" className="w-full sm:w-auto border-gold/40 text-gold-300 hover:bg-gold/10">
              Compare plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
