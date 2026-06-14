"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { readAnalyticsConsent } from "@/lib/consent/marketing-consent";
import type { ConsentChoices } from "@/lib/consent/marketing-consent";
import { GA_MEASUREMENT_ID, updateGoogleAnalyticsConsent } from "@/lib/analytics/google-analytics";

function pagePath(pathname: string, searchParams: URLSearchParams): string {
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Syncs consent cookie + SPA page views with gtag (script loaded in root layout). */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    updateGoogleAnalyticsConsent(readAnalyticsConsent() === true);

    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentChoices>).detail;
      updateGoogleAnalyticsConsent(detail.analytics === true);
    };

    window.addEventListener("dv:consent-updated", onConsent);
    return () => window.removeEventListener("dv:consent-updated", onConsent);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag || readAnalyticsConsent() !== true) return;
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath(pathname, searchParams),
    });
  }, [pathname, searchParams]);

  return null;
}
