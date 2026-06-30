import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { assertInboxAccess, getInboxAccess } from "@/lib/inbox/access";

export async function requireInboxSession(dealershipId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new InboxAuthError("Unauthorized", 401);
  }

  let resolvedDealershipId = dealershipId;
  if (!resolvedDealershipId) {
    const staff = await prisma.dealerStaff.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { invitedAt: "asc" },
      select: { dealershipId: true },
    });
    if (!staff) throw new InboxAuthError("No dealership", 403);
    resolvedDealershipId = staff.dealershipId;
  }

  const access = await assertInboxAccess(session.user.id, resolvedDealershipId);
  return { session, userId: session.user.id, dealershipId: resolvedDealershipId, access };
}

export async function getInboxSession(dealershipId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  let resolvedDealershipId = dealershipId;
  if (!resolvedDealershipId) {
    const staff = await prisma.dealerStaff.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { invitedAt: "asc" },
      select: { dealershipId: true },
    });
    if (!staff) return null;
    resolvedDealershipId = staff.dealershipId;
  }

  const access = await getInboxAccess(session.user.id, resolvedDealershipId);
  return { session, userId: session.user.id, dealershipId: resolvedDealershipId, access };
}

export class InboxAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function inboxErrorResponse(err: unknown) {
  if (err instanceof InboxAuthError) {
    return NextResponse.json({ error: err.message, code: err.message }, { status: err.status });
  }
  if (err instanceof Error && "code" in err) {
    return NextResponse.json({ error: err.message, code: (err as Error & { code: string }).code }, { status: 403 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
