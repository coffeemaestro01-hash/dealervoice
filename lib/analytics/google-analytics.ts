/** Google Analytics helpers — Consent Mode v2 (tag always loads; storage gated by cookie choice). */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function updateGoogleAnalyticsConsent(analyticsGranted: boolean) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("consent", "update", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
