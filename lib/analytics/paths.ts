/** Normalize dynamic URL segments for aggregation. */
export function normalizePath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const normalized = parts.map((seg, i) => {
    if (i === 0 && seg === "dealership") return "dealership";
    if (parts[0] === "dealership" && i === 1) return "[slug]";
    if (parts[0] === "dealers" && i === 1 && seg.length === 2) return "[country]";
    if (parts[0] === "dealers" && parts[1]?.length === 2 && i === 2) return "[city]";
    if (parts[0] === "write-review" && i === 1) return "[id]";
    if (parts[0] === "blog" && i === 1) return "[slug]";
    if (parts[0] === "dashboard" && i >= 2) return seg;
    if (/^[a-f0-9]{20,}$/i.test(seg) || /^c[a-z0-9]{20,}$/i.test(seg)) return "[id]";
    if (/^\d+$/.test(seg)) return "[id]";
    return seg;
  });
  return "/" + normalized.join("/");
}

export function shouldTrackPath(pathname: string): boolean {
  if (!pathname || pathname === "/favicon.ico") return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/api/analytics/collect")) return false;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|txt|xml)$/)) return false;
  return true;
}
