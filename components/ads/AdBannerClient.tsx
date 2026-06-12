"use client";

import { useEffect, useRef } from "react";
import { Megaphone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutomotiveAd } from "@/lib/ads/automotive";

interface Props {
  content: AutomotiveAd;
  href: string;
  className?: string;
  compact?: boolean;
  placementId?: string;
  slot: string;
}

export function AdBannerClient({ content, href, className, compact, placementId, slot }: Props) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    const params = new URLSearchParams({ type: content.type, slot });
    if (placementId) params.set("placementId", placementId);
    fetch(`/api/ads/impression?${params}`, { method: "POST", keepalive: true }).catch(() => {});
  }, [content.type, slot, placementId]);

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
          <a
            href={href}
            target="_blank"
            rel="noopener sponsored noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 mt-4 font-semibold rounded-lg w-fit",
              "bg-white/15 hover:bg-white/25 transition-colors",
              compact ? "text-xs px-3 py-2" : "text-sm px-4 py-2.5"
            )}
          >
            {content.ctaLabel}
            <ArrowRight size={14} aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  );
}
