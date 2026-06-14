export const CONSENT_COOKIE = "dv_consent";

export type ConsentChoices = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

function readConsentChoices(): ConsentChoices | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    const c = parsed?.choices;
    if (
      typeof c?.functional === "boolean" &&
      typeof c?.analytics === "boolean" &&
      typeof c?.marketing === "boolean"
    ) {
      return c as ConsentChoices;
    }
  } catch {
    return null;
  }

  return null;
}

/** Read marketing consent from the dv_consent cookie (client only). */
export function readMarketingConsent(): boolean | null {
  return readConsentChoices()?.marketing ?? null;
}

/** Read analytics consent from the dv_consent cookie (client only). */
export function readAnalyticsConsent(): boolean | null {
  return readConsentChoices()?.analytics ?? null;
}

export function dispatchConsentUpdated(choices: ConsentChoices) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dv:consent-updated", { detail: choices }));
}
