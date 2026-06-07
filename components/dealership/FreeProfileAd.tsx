import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  dealerName: string;
  dealerId: string;
}

/** Sponsored placement on unclaimed / free-tier dealer profiles. */
export function FreeProfileAd({ dealerName, dealerId }: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-gold-400 text-xs font-medium uppercase tracking-wide mb-2">
          <Megaphone size={12} />
          Sponsored
        </div>
        <h3 className="font-semibold text-white mb-1">Own {dealerName}?</h3>
        <p className="text-gray-300 text-sm mb-4">
          Claim this profile free — respond to reviews, unlock analytics, and grow your reputation.
        </p>
        <Link href={`/claim?dealer=${dealerId}`}>
          <Button size="sm" className="w-full bg-gold-500 hover:bg-gold-600 text-gray-900 font-semibold border-0">
            Claim for free
          </Button>
        </Link>
        <p className="text-center mt-3">
          <Link href="/advertise" className="text-xs text-gray-400 hover:text-gold-400">
            Advertise on DealerVoice →
          </Link>
        </p>
      </div>
    </div>
  );
}
