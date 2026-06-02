"use client";

import { useEffect, useState } from "react";

const COOKIE_NAME = "dv_consent";

function hasConsent(category: "functional" | "analytics" | "marketing"): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
  if (!m) return false;
  try {
    const parsed = JSON.parse(decodeURIComponent(m[2]));
    return !!parsed?.choices?.[category];
  } catch {
    return false;
  }
}

/**
 * Renders children only after the visitor has granted consent for `category`.
 * Wrap any analytics/marketing script in this so nothing loads before consent
 * (DPDP Act 2023 §6 — opt-in).
 */
export function ConsentGate({
  category,
  children,
}: {
  category: "functional" | "analytics" | "marketing";
  children: React.ReactNode;
}) {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(hasConsent(category));
    const handler = () => setGranted(hasConsent(category));
    // Re-evaluate if the user changes preferences in the banner
    window.addEventListener("dv:consent-updated", handler);
    return () => window.removeEventListener("dv:consent-updated", handler);
  }, [category]);

  if (!granted) return null;
  return <>{children}</>;
}
