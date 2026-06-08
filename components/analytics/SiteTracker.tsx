"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function SiteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const qs = searchParams.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;
    if (lastPath.current === fullPath) return;

    const durationMs = lastPath.current ? Date.now() - startTime.current : undefined;
    lastPath.current = fullPath;
    startTime.current = Date.now();

    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        path: fullPath,
        queryString: qs || null,
        durationMs,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
