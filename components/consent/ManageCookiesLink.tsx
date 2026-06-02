"use client";

export function ManageCookiesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("dv:open-cookie-settings"))}
      className={className ?? "hover:text-gold-300 transition-colors"}
    >
      Manage cookies
    </button>
  );
}
