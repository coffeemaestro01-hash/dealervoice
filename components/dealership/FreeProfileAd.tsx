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
    <div className="bg-gradient-to-br from-muted to-muted rounded-xl p-5 text-foreground shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-2">
          <Megaphone size={12} />
          Sponsored
        </div>
        <h3 className="font-semibold text-foreground mb-1">Own {dealerName}?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Claim this profile free — respond to reviews, unlock analytics, and grow your reputation.
        </p>
        <Link href={`/claim?dealer=${dealerId}`}>
          <Button size="sm" className="w-full bg-primary/10 hover:bg-primary text-foreground font-semibold border-0">
            Claim for free
          </Button>
        </Link>
        <p className="text-center mt-3">
          <Link href="/advertise" className="text-xs text-muted-foreground hover:text-primary">
            Advertise on DealerVoice →
          </Link>
        </p>
      </div>
    </div>
  );
}
