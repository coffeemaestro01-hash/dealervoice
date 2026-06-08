export const CONSENT_COOKIE = "dv_consent";

export type ConsentChoices = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

/** Read marketing consent from the dv_consent cookie (client only). */
export function readMarketingConsent(): boolean | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (typeof parsed?.choices?.marketing === "boolean") {
      return parsed.choices.marketing;
    }
  } catch {
    return null;
  }

  return null;
}

export function dispatchConsentUpdated(choices: ConsentChoices) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dv:consent-updated", { detail: choices }));
}
