"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const NOTICE_VERSION = "v1.0";
const COOKIE_NAME = "dv_consent";

type Cat = "functional" | "analytics" | "marketing";
const CATS: { key: Cat; label: string; desc: string }[] = [
  { key: "functional", label: "Functional", desc: "Remember your preferences (e.g. language, saved searches)." },
  { key: "analytics", label: "Analytics", desc: "Help us understand how the site is used so we can improve it." },
  { key: "marketing", label: "Marketing", desc: "Measure campaigns and show relevant content. Off by default." },
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
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<Record<Cat, boolean>>({ functional: false, analytics: false, marketing: false });

  useEffect(() => {
    const raw = getCookie(COOKIE_NAME);
    if (!raw) { setOpen(true); return; }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.v !== NOTICE_VERSION) setOpen(true); // notice changed → re-prompt
      else if (parsed.choices) setChoices(parsed.choices);
    } catch { setOpen(true); }
  }, []);

  // Footer "Manage cookies" re-opens the banner
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("dv:open-cookie-settings", handler);
    return () => window.removeEventListener("dv:open-cookie-settings", handler);
  }, []);

  const persist = useCallback(async (final: Record<Cat, boolean>) => {
    setCookie(COOKIE_NAME, JSON.stringify({ v: NOTICE_VERSION, choices: final, ts: Date.now() }), 365);
    setChoices(final);
    setOpen(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: final, anonId: getAnonId(), source: "banner" }),
      });
    } catch { /* cookie already set; ledger write is best-effort */ }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gold/30 overflow-hidden">
        <div className="bg-night-gradient px-5 py-4 flex items-center gap-2">
          <Cookie size={18} className="text-gold-400" />
          <h2 className="font-semibold text-white">We use cookies</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">
            We use cookies to run the site and, with your consent, to improve it. Choose what to allow.
            Read our <Link href="/cookies" className="text-gold-700 hover:underline">Cookie Policy</Link> and{" "}
            <Link href="/privacy" className="text-gold-700 hover:underline">Privacy Policy</Link>.
          </p>

          <div className="space-y-2.5 mb-5">
            <label className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <span>
                <span className="text-sm font-medium text-gray-900 block">Strictly necessary</span>
                <span className="text-xs text-gray-500">Required for sign-in and security. Always on.</span>
              </span>
              <input type="checkbox" checked disabled className="mt-1 accent-gold-600" />
            </label>
            {CATS.map((c) => (
              <label key={c.key} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 p-3 cursor-pointer">
                <span>
                  <span className="text-sm font-medium text-gray-900 block">{c.label}</span>
                  <span className="text-xs text-gray-500">{c.desc}</span>
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

          {/* All three buttons equally prominent (no dark patterns — DPDP §6) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => persist({ functional: false, analytics: false, marketing: false })}
              className="h-11 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50"
            >
              Reject all
            </button>
            <button
              onClick={() => persist(choices)}
              className="h-11 rounded-lg border border-gold/50 text-gold-700 font-medium text-sm hover:bg-gold-50"
            >
              Save preferences
            </button>
            <button
              onClick={() => persist({ functional: true, analytics: true, marketing: true })}
              className="h-11 rounded-lg bg-gold-gradient text-night-900 font-semibold text-sm hover:opacity-90"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
