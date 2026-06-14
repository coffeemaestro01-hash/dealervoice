"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { readAnalyticsConsent } from "@/lib/consent/marketing-consent";
import type { ConsentChoices } from "@/lib/consent/marketing-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function pagePath(pathname: string, searchParams: URLSearchParams): string {
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(readAnalyticsConsent() === true);

    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentChoices>).detail;
      setEnabled(detail.analytics === true);
    };

    window.addEventListener("dv:consent-updated", onConsent);
    return () => window.removeEventListener("dv:consent-updated", onConsent);
  }, []);

  useEffect(() => {
    if (!enabled || !MEASUREMENT_ID || !window.gtag) return;
    window.gtag("config", MEASUREMENT_ID, {
      page_path: pagePath(pathname, searchParams),
    });
  }, [enabled, pathname, searchParams]);

  if (!MEASUREMENT_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
