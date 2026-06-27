import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  getChicagoJackpotAdminSummary,
  isChicagoDealership,
  isClaimedDealership,
  syncChicagoJackpotForDealership,
} from "@/lib/promotions/chicago-jackpot";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [jackpot, billingRedemptions] = await Promise.all([
    getChicagoJackpotAdminSummary(),
    prisma.billingPeriodRedemption.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        dealership: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return NextResponse.json({ jackpot, billingRedemptions });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dealers = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      OR: [{ status: "CLAIMED" }, { claimedAt: { not: null } }],
    },
    select: { id: true, cityName: true, stateCode: true, status: true, claimedAt: true },
    take: 500,
  });

  let synced = 0;
  for (const d of dealers) {
    if (isChicagoDealership(d) && isClaimedDealership(d)) {
      await syncChicagoJackpotForDealership(d.id).catch(() => {});
      synced += 1;
    }
  }

  const jackpot = await getChicagoJackpotAdminSummary();
  return NextResponse.json({ ok: true, synced, jackpot });
}
