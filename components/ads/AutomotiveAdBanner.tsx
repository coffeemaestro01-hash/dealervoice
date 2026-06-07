import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FALLBACK_AUTOMOTIVE_ADS,
  type AutomotiveAdType,
  type AutomotiveAd,
} from "@/lib/ads/automotive";

interface Props {
  type: AutomotiveAdType;
  ad?: Partial<AutomotiveAd>;
  className?: string;
  compact?: boolean;
}

export function AutomotiveAdBanner({ type, ad, className, compact }: Props) {
  const content: AutomotiveAd = { ...FALLBACK_AUTOMOTIVE_ADS[type], ...ad, type };

  return (
    <aside
      role="complementary"
      aria-label={`Sponsored ${content.badge}`}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 shadow-lg h-full",
        className
      )}
    >
      <div
        className={cn(
          "bg-gradient-to-br text-white h-full min-h-[220px] md:min-h-[240px] flex flex-col",
          content.accent,
          compact ? "p-4" : "p-5 md:p-6"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col flex-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
            <Megaphone size={12} aria-hidden />
            <span>Sponsored · {content.badge}</span>
          </div>
          <h3 className={cn("font-bold text-white leading-tight", compact ? "text-base" : "text-lg md:text-xl")}>
            {content.headline}
          </h3>
          <p
            className={cn(
              "text-white/80 mt-1.5 leading-snug flex-1",
              compact ? "text-xs line-clamp-3" : "text-sm line-clamp-4"
            )}
          >
            {content.subheadline}
          </p>
          <Link
            href={content.ctaHref}
            className={cn(
              "inline-flex items-center gap-1.5 mt-4 font-semibold rounded-lg w-fit",
              "bg-white/15 hover:bg-white/25 transition-colors",
              compact ? "text-xs px-3 py-2" : "text-sm px-4 py-2.5"
            )}
          >
            {content.ctaLabel}
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
