import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { shouldTrackPath } from "@/lib/analytics/paths";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/pricing",
  "/blog",
  "/research",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/dmca",
  "/grievance",
  "/shipping-refunds",
  "/bis-compliance",
  "/methodology",
  "/careers",
  "/advertise",
  "/api-docs",
  "/chicago",
  "/claim",
  "/unsubscribe",
  "/trust",
  "/dealers",
  "/dealership",
  "/verify-email",
  "/write-review",
  "/settings",
  "/test-payment",
  "/vehicles",
];

const DEALER_PATHS = ["/dashboard/dealer"];
const ADMIN_PATHS = ["/dashboard/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Illinois / U.S. positioning — redirect legacy India marketing routes
  if (pathname === "/dealers/in" || pathname.startsWith("/dealers/in/")) {
    const dest = pathname.includes("/inventory") ? "/dealers/us/inventory" : "/chicago";
    return NextResponse.redirect(new URL(dest, req.url), 308);
  }

  // SEO + static assets — never gate
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/ads.txt" ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // All API routes enforce auth themselves (return 401 JSON, not HTML redirect)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const role = token.role as string;

    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      const staff = ["MODERATOR", "SUPER_ADMIN", "SUPPORT", "REVENUE"];
      if (!staff.includes(role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (DEALER_PATHS.some((p) => pathname.startsWith(p))) {
      if (!["DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  if (shouldTrackPath(pathname)) {
    const trackUrl = new URL("/api/analytics/collect", req.url);
    trackUrl.searchParams.set("path", pathname + req.nextUrl.search);
    const ref = req.headers.get("referer");
    if (ref) trackUrl.searchParams.set("ref", ref);
    fetch(trackUrl.toString(), {
      method: "GET",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    }).catch(() => {});
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
