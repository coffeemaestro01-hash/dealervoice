"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { dispatchConsentUpdated } from "@/lib/consent/marketing-consent";

const NOTICE_VERSION = "v1.0";
const COOKIE_NAME = "dv_consent";
const SHOW_DELAY_MS = 3000;
const SCROLL_THRESHOLD = 160;

type Cat = "functional" | "analytics" | "marketing";
const CATS: { key: Cat; label: string; desc: string }[] = [
  { key: "functional", label: "Functional", desc: "Remember your preferences (e.g. language, saved searches)." },
  { key: "analytics", label: "Analytics", desc: "Google Analytics — help us understand how the site is used so we can improve it." },
  { key: "marketing", label: "Marketing", desc: "Google AdSense and sponsored content. Off by default." },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax;Secure`;
}
function getAnonId(): string {
  let id = localStorage.getItem("dv_anon");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("dv_anon", id); }
  return id;
}

export function CookieBanner() {
  const [needsConsent, setNeedsConsent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [choices, setChoices] = useState<Record<Cat, boolean>>({ functional: false, analytics: false, marketing: false });

  useEffect(() => {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) {
      setNeedsConsent(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.v !== NOTICE_VERSION) setNeedsConsent(true);
      else if (parsed.choices) setChoices(parsed.choices);
    } catch {
      setNeedsConsent(true);
    }
  }, []);

  useEffect(() => {
    if (!needsConsent) return;

    const show = () => setVisible(true);
    const timer = setTimeout(show, SHOW_DELAY_MS);
    const onScroll = () => {
      if (window.scrollY >= SCROLL_THRESHOLD) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [needsConsent]);

  useEffect(() => {
    const handler = () => {
      setNeedsConsent(true);
      setVisible(true);
      setExpanded(true);
    };
    window.addEventListener("dv:open-cookie-settings", handler);
    return () => window.removeEventListener("dv:open-cookie-settings", handler);
  }, []);

  const persist = useCallback(async (final: Record<Cat, boolean>) => {
    setCookie(COOKIE_NAME, JSON.stringify({ v: NOTICE_VERSION, choices: final, ts: Date.now() }), 365);
    setChoices(final);
    setNeedsConsent(false);
    setVisible(false);
    setExpanded(false);
    dispatchConsentUpdated(final);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: final, anonId: getAnonId(), source: "banner" }),
      });
    } catch { /* cookie already set; ledger write is best-effort */ }
  }, []);

  if (!needsConsent || !visible) return null;

  if (!expanded) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-[100] p-3 sm:p-4 pointer-events-none">
        <div className="container max-w-4xl mx-auto pointer-events-auto bg-card rounded-xl shadow-xl border border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Cookie size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              We use cookies to run the site and, with your consent, to improve it.{" "}
              <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(true)}
              className="h-9 px-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted"
            >
              Manage
            </button>
            <button
              onClick={() => persist({ functional: false, analytics: false, marketing: false })}
              className="h-9 px-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted"
            >
              Reject
            </button>
            <button
              onClick={() => persist({ functional: true, analytics: true, marketing: true })}
              className="h-9 px-4 rounded-lg bg-ember text-night-900 font-semibold text-sm hover:opacity-90"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-primary/30 overflow-hidden">
        <div className="bg-pearl px-5 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cookie size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">We use cookies</h2>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Close cookie settings"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            We use cookies to run the site and, with your consent, to improve it. Choose what to allow.
            Read our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link> and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>

          <div className="space-y-2.5 mb-5">
            <label className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted p-3">
              <span>
                <span className="text-sm font-medium text-foreground block">Strictly necessary</span>
                <span className="text-xs text-muted-foreground">Required for sign-in and security. Always on.</span>
              </span>
              <input type="checkbox" checked disabled className="mt-1 accent-gold-600" />
            </label>
            {CATS.map((c) => (
              <label key={c.key} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 cursor-pointer">
                <span>
                  <span className="text-sm font-medium text-foreground block">{c.label}</span>
                  <span className="text-xs text-muted-foreground">{c.desc}</span>
                </span>
                <input
                  type="checkbox"
                  checked={choices[c.key]}
                  onChange={(e) => setChoices((s) => ({ ...s, [c.key]: e.target.checked }))}
                  className="mt-1 accent-gold-600"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => persist({ functional: false, analytics: false, marketing: false })}
              className="h-11 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted"
            >
              Reject all
            </button>
            <button
              onClick={() => persist(choices)}
              className="h-11 rounded-lg border border-primary/30 text-primary font-medium text-sm hover:bg-primary/10"
            >
              Save preferences
            </button>
            <button
              onClick={() => persist({ functional: true, analytics: true, marketing: true })}
              className="h-11 rounded-lg bg-ember text-night-900 font-semibold text-sm hover:opacity-90"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
