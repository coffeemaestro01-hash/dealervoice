"use client";

import { useEffect, useState } from "react";

/** Shows "or continue with email" only when OAuth providers are configured. */
export function AuthDivider() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        const ids = Object.keys(data ?? {}).filter((k) => k !== "credentials");
        setShow(ids.length > 0);
      })
      .catch(() => setShow(false));
  }, []);

  if (!show) return null;

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-card text-muted-foreground">or continue with email</span>
      </div>
    </div>
  );
}
