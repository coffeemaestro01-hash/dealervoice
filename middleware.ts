import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { shouldTrackPath } from "@/lib/analytics/paths";
import {
  CANONICAL_AUTH_ORIGIN,
  TICKETING_HOST,
} from "@/lib/auth/cookie-domain";

const ADMIN_PATHS = ["/dashboard/admin"];
const TICKETING_PREFIX = "/ticketing";
const DEALER_DASHBOARD_PREFIX = "/dashboard/dealer";

/** OAuth redirect URIs are registered on dealervoice.io — sign in there, then return. */
function ticketingAuthLoginRedirect(req: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", CANONICAL_AUTH_ORIGIN);
  const callbackUrl = `${req.nextUrl.origin}${pathname}${req.nextUrl.search}`;
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(loginUrl);
}

/** Dashboard and Inbox routes require login. */
function requiresAuth(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === TICKETING_PREFIX ||
    pathname.startsWith(`${TICKETING_PREFIX}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host")?.split(":")[0] ?? "";

  if (host === TICKETING_HOST && (pathname === "/" || pathname === "")) {
    return NextResponse.redirect(new URL("/ticketing/inbox", req.url));
  }

  if (
    host === TICKETING_HOST &&
    (pathname === "/login" || pathname === "/register")
  ) {
    const canonicalAuth = new URL(pathname, CANONICAL_AUTH_ORIGIN);
    req.nextUrl.searchParams.forEach((value, key) => {
      if (key === "callbackUrl") {
        const cb = value.startsWith("http")
          ? value
          : `${req.nextUrl.origin}${value.startsWith("/") ? value : `/${value}`}`;
        canonicalAuth.searchParams.set(key, cb);
        return;
      }
      canonicalAuth.searchParams.set(key, value);
    });
    return NextResponse.redirect(canonicalAuth);
  }

  if (pathname === "/dealers/in" || pathname.startsWith("/dealers/in/")) {
    const dest = pathname.includes("/inventory") ? "/dealers/us/inventory" : "/chicago";
    return NextResponse.redirect(new URL(dest, req.url), 308);
  }

  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/llms.txt" ||
    pathname === "/ads.txt" ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const needsAuth = requiresAuth(pathname);
  const token = needsAuth ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) : null;

  if (needsAuth && !token) {
    if (host === TICKETING_HOST) {
      return ticketingAuthLoginRedirect(req, pathname);
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
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

    if (pathname.startsWith(DEALER_DASHBOARD_PREFIX)) {
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
