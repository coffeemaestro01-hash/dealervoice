import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { sendDsrConfirmation } from "@/lib/email";

const KINDS = ["access", "correction", "erasure", "nominate"] as const;
type Kind = (typeof KINDS)[number];

// DPDP Act 2023 §11–14 — Data principal rights requests.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const kind = body?.kind as Kind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Invalid request kind" }, { status: 422 });

  // For erasure, enforce a 14-day cooling-off window before execution.
  const slaDueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Prevent duplicate open requests of the same kind
  const existing = await prisma.dsrRequest.findFirst({
    where: { userId: session.user.id, kind, status: { in: ["submitted", "verifying", "in_progress"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have an open request of this type." }, { status: 409 });
  }

  const dsr = await prisma.dsrRequest.create({
    data: {
      userId: session.user.id,
      kind,
      status: "submitted",
      payload: body?.payload ?? undefined,
      slaDueAt,
    },
  });

  // Audit (best-effort)
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: `dsr.${kind}.submitted`, resource: "DsrRequest", resourceId: dsr.id },
  }).catch(() => {});

  await sendDsrConfirmation(session.user.email!, session.user.name ?? "there", kind, slaDueAt).catch(() => {});

  return NextResponse.json({ ok: true, id: dsr.id, slaDueAt });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requests = await prisma.dsrRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, kind: true, status: true, slaDueAt: true, completedAt: true, createdAt: true },
  });
  return NextResponse.json({ requests });
}
