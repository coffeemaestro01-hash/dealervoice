"use client";

import Script from "next/script";
import { getAdSenseClientId } from "@/lib/ads/adsense";

const CLIENT_ID = getAdSenseClientId();

/** Site-wide loader — always on when configured so Google can verify the domain. */
export function AdSenseProvider() {
  if (!CLIENT_ID) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
