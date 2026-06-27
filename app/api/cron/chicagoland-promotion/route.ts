import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  checkWinnerMonthlyCompliance,
  isChicagoDealership,
  isClaimedDealership,
  syncChicagoJackpotForDealership,
} from "@/lib/promotions/chicago-jackpot";

/** Daily sync + monthly compliance for Chicagoland Dealership Promotion winners. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const winners = await prisma.chicagoJackpotEntry.findMany({
      where: { status: "WINNER" },
      select: { id: true },
    });

    let complianceChecked = 0;
    for (const w of winners) {
      await checkWinnerMonthlyCompliance(w.id);
      complianceChecked += 1;
    }

    const dealers = await prisma.dealership.findMany({
      where: {
        deletedAt: null,
        OR: [{ status: "CLAIMED" }, { claimedAt: { not: null } }],
      },
      select: { id: true, cityName: true, stateCode: true, status: true, claimedAt: true },
      take: 200,
    });

    let synced = 0;
    for (const d of dealers) {
      if (isChicagoDealership(d) && isClaimedDealership(d)) {
        await syncChicagoJackpotForDealership(d.id).catch(() => {});
        synced += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      complianceChecked,
      synced,
      winners: winners.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chicagoland promotion cron failed";
    console.error("chicagoland-promotion cron:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
