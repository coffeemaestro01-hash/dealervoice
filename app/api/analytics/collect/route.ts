import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { recordSiteEvent } from "@/lib/analytics/track";
import { buildRequestMeta } from "@/lib/analytics/parse-request";
import { shouldTrackPath } from "@/lib/analytics/paths";

const COOKIE_VISITOR = "dv_vid";
const COOKIE_SESSION = "dv_sid";
const SESSION_MAX_AGE = 30 * 60;

function newId() {
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  let body: {
    eventType?: string;
    path?: string;
    queryString?: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
    sessionId?: string;
    visitorId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = body.path ?? "/";
  if (!shouldTrackPath(path.split("?")[0])) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const visitorId = body.visitorId ?? req.cookies.get(COOKIE_VISITOR)?.value ?? newId();
  const sessionId = body.sessionId ?? req.cookies.get(COOKIE_SESSION)?.value ?? newId();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = new URL(path, req.nextUrl.origin);
  const meta = buildRequestMeta(req, req.headers.get("referer"), url.searchParams);

  try {
    await recordSiteEvent({
      eventType: body.eventType ?? "page_view",
      path,
      queryString: body.queryString ?? (url.search || null),
      sessionId,
      visitorId,
      userId: token?.sub ?? null,
      userRole: (token?.role as string) ?? null,
      durationMs: body.durationMs ?? null,
      metadata: body.metadata ?? null,
      meta,
    });
  } catch (err) {
    console.error("[analytics/collect]", err);
  }

  const res = NextResponse.json({ ok: true, sessionId, visitorId });
  res.cookies.set(COOKIE_VISITOR, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });
  res.cookies.set(COOKIE_SESSION, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

/** GET — lightweight beacon from middleware */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") ?? "/";
  if (!shouldTrackPath(path.split("?")[0])) {
    return new NextResponse(null, { status: 204 });
  }

  const visitorId = req.cookies.get(COOKIE_VISITOR)?.value ?? newId();
  const sessionId = req.cookies.get(COOKIE_SESSION)?.value ?? newId();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const meta = buildRequestMeta(req, searchParams.get("ref"));

  try {
    await recordSiteEvent({
      eventType: searchParams.get("type") ?? "page_view",
      path,
      queryString: searchParams.get("qs"),
      sessionId,
      visitorId,
      userId: token?.sub ?? null,
      userRole: (token?.role as string) ?? null,
      meta,
    });
  } catch (err) {
    console.error("[analytics/collect GET]", err);
  }

  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(COOKIE_VISITOR, visitorId, { httpOnly: true, sameSite: "lax", maxAge: 365 * 24 * 60 * 60, path: "/" });
  res.cookies.set(COOKIE_SESSION, sessionId, { httpOnly: true, sameSite: "lax", maxAge: SESSION_MAX_AGE, path: "/" });
  return res;
}
