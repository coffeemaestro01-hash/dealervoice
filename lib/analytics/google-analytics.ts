/** Google Analytics — hardcoded fallback so production never ships without the tag. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5S5QK4W9TS";

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
