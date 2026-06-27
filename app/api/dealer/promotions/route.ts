import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  isChicagoDealership,
  isClaimedDealership,
  syncChicagoJackpotForDealership,
} from "@/lib/promotions/chicago-jackpot";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      dealership: {
        select: {
          id: true,
          cityName: true,
          stateCode: true,
          status: true,
          claimedAt: true,
        },
      },
    },
  });

  if (!staff) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const dealer = staff.dealership;
  const chicagoEligible =
    isChicagoDealership(dealer) && isClaimedDealership(dealer);

  let jackpot = null;
  if (chicagoEligible) {
    jackpot = await syncChicagoJackpotForDealership(dealer.id);
  } else {
    jackpot = await prisma.chicagoJackpotEntry.findUnique({
      where: { dealershipId: dealer.id },
    });
  }

  const billingRedemptions = await prisma.billingPeriodRedemption.findMany({
    where: { dealershipId: dealer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    chicagoEligible,
    jackpot,
    billingRedemptions,
  });
}
