"use client";

import Link from "next/link";
import { Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  dealerId: string;
  dealerName: string;
  dealerSlug: string;
}

/** Prominent owner conversion CTA — opens claim modal via ?claim=1 or routes to pricing. */
export function ClaimProfileCTA({ dealerId, dealerName, dealerSlug }: Props) {
  return (
    <section
      aria-label="Claim this dealership profile"
      className="bg-night rounded-2xl border-2 border-gold/40 p-5 md:p-6 text-center shadow-xl"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/15 text-gold-400 mb-3">
        <Building2 size={22} aria-hidden />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
        Own {dealerName}?
      </h2>
      <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-5">
        Claim this profile to remove competitor ads, respond to reviews, and link your live inventory.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/dealership/${dealerSlug}?claim=1`}>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gold-gradient text-night-900 font-bold hover:opacity-90 border-0 gap-2"
          >
            <Sparkles size={16} aria-hidden />
            Claim This Profile
          </Button>
        </Link>
        <Link href={`/pricing?dealer=${dealerId}`}>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-gold/40 text-gold-300 hover:bg-gold/10 hover:text-gold-200"
          >
            View Premium Plans
          </Button>
        </Link>
      </div>
    </section>
  );
}
