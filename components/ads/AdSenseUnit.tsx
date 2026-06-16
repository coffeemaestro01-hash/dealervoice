"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getAdSenseClientId,
  getAdSenseSlotId,
  type AdSenseSlotKey,
} from "@/lib/ads/adsense";
import { readMarketingConsent } from "@/lib/consent/marketing-consent";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface Props {
  slotKey: AdSenseSlotKey;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  layout?: string;
  layoutKey?: string;
  className?: string;
}

const CLIENT_ID = getAdSenseClientId();

export function AdSenseUnit({
  slotKey,
  format = "auto",
  layout,
  layoutKey,
  className,
}: Props) {
  const slotId = getAdSenseSlotId(slotKey);
  const pushed = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const allowed = readMarketingConsent() === true;
      setReady(!!CLIENT_ID && !!slotId && allowed);
    };
    sync();
    window.addEventListener("dv:consent-updated", sync);
    return () => window.removeEventListener("dv:consent-updated", sync);
  }, [slotId]);

  useEffect(() => {
    if (!ready || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      pushed.current = false;
    }
  }, [ready]);

  if (!CLIENT_ID || !slotId) return null;
  if (!ready) return null;

  return (
    <aside aria-label="Advertisement" className={cn("min-h-[90px]", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Ad</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
