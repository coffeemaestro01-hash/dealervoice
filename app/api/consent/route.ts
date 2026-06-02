import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// Current privacy/cookie notice version. Bump this whenever the notice text
// changes - the banner re-prompts visitors who consented under an older version.
// (Keep in sync with NOTICE_VERSION in components/consent/CookieBanner.tsx)
const NOTICE_VERSION = "v1.0";

const CATEGORIES = ["strictly_necessary", "functional", "analytics", "marketing"] as const;

function hashIp(req: NextRequest): string | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip) return null;
  const salt = process.env.NEXTAUTH_SECRET ?? "dv";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { choices, anonId, source } = body as {
    choices?: Record<string, boolean>;
    anonId?: string;
    source?: string;
  };
  if (!choices || typeof choices !== "object") {
    return NextResponse.json({ error: "Missing choices" }, { status: 400 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user?.id ?? null;
  const ipHash = hashIp(req);
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;

  // Append one immutable row per category (never update/delete existing rows)
  const rows = CATEGORIES.map((cat) => ({
    userId,
    anonId: userId ? null : anonId ?? null,
    purpose: cat,
    status: (cat === "strictly_necessary" || choices[cat]) ? ("GRANTED" as const) : ("DENIED" as const),
    noticeVersion: NOTICE_VERSION,
    source: source ?? "banner",
    ipHash,
    userAgent,
  }));

  await prisma.consent.createMany({ data: rows });

  return NextResponse.json({ ok: true, noticeVersion: NOTICE_VERSION });
}

// Returns the latest consent state for the current user (authenticated only)
export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user?.id) return NextResponse.json({ consents: {} });

  const rows = await prisma.consent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const latest: Record<string, string> = {};
  for (const r of rows) if (!(r.purpose in latest)) latest[r.purpose] = r.status;
  return NextResponse.json({ consents: latest, noticeVersion: NOTICE_VERSION });
}
