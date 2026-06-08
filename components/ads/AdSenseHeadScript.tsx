import Script from "next/script";
import { getAdSenseClientId } from "@/lib/ads/adsense";

/**
 * Injected into <head> via beforeInteractive — required for Google AdSense site verification.
 * Client-side afterInteractive loading is not visible to the AdSense crawler.
 */
export function AdSenseHeadScript() {
  const clientId = getAdSenseClientId();
  if (!clientId) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
