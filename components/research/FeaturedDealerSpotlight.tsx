import Image from "next/image";
import Link from "next/link";
import { Building2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeaturedDealerSpotlight as Spotlight } from "@/lib/research/types";

const TIER_STYLES: Record<Spotlight["planTier"], { label: string; className: string }> = {
  PRO: { label: "Pro Dealer", className: "bg-gold-500/20 text-gold-300 border-gold-500/30" },
  ENTERPRISE: { label: "Enterprise", className: "bg-gold-600/25 text-gold-200 border-gold-400/40" },
  SPONSORED: { label: "Sponsored", className: "bg-white/10 text-gray-300 border-white/20" },
};

export function FeaturedDealerSpotlightCard({ dealer }: { dealer: Spotlight }) {
  const tier = TIER_STYLES[dealer.planTier];

  return (
    <article className="rounded-2xl border border-white/10 bg-night-700/80 overflow-hidden flex flex-col">
      <div className="relative h-44 bg-night-600">
        {dealer.imageUrl ? (
          <Image
            src={dealer.imageUrl}
            alt={dealer.ceoName}
            fill
            className="object-cover object-top opacity-90"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-900/40 to-night-800">
            <Building2 className="text-gold-500/50" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/40 to-transparent" />
        <span
          className={cn(
            "absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-flex items-center gap-1",
            tier.className
          )}
        >
          {dealer.planTier === "ENTERPRISE" && <Crown size={10} />}
          {tier.label}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <blockquote className="text-gray-200 text-sm leading-relaxed italic flex-1">
          &ldquo;{dealer.quote}&rdquo;
        </blockquote>
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="font-semibold text-white">{dealer.ceoName}</p>
          <p className="text-xs text-gray-400">
            {dealer.title} · {dealer.dealershipName}
            {dealer.city ? ` · ${dealer.city}` : ""}
          </p>
          {dealer.dealerSlug && (
            <Link
              href={`/dealership/${dealer.dealerSlug}`}
              className="text-xs text-gold-400 hover:text-gold-300 mt-2 inline-block font-medium"
            >
              View dealership profile →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function FeaturedDealerSpotlightGrid({ dealers }: { dealers: Spotlight[] }) {
  if (dealers.length === 0) return null;

  return (
    <section className="my-12" aria-labelledby="dealer-spotlights-heading">
      <h2 id="dealer-spotlights-heading" className="text-xl font-bold text-white mb-2">
        Voices from premium dealerships
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Pro, Enterprise, and sponsored partners share why outlet-level trust infrastructure matters.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        {dealers.map((d) => (
          <FeaturedDealerSpotlightCard key={`${d.dealershipName}-${d.ceoName}`} dealer={d} />
        ))}
      </div>
    </section>
  );
}
