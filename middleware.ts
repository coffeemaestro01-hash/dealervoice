import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/pricing",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/dmca",
  "/careers",
  "/advertise",
  "/api-docs",
  "/claim",
  "/unsubscribe",
  "/dealers",
  "/dealership",
  "/verify-email",
];

const DEALER_PATHS = ["/dashboard/dealer"];
const ADMIN_PATHS = ["/dashboard/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and API routes (auth-checked per-route)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2)$/)
  ) {
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
      if (role !== "MODERATOR" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (DEALER_PATHS.some((p) => pathname.startsWith(p))) {
      if (!["DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  // Security headers are added in next.config.ts
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
