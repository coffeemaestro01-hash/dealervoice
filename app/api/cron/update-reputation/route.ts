import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { calculateReputationScore } from "@/lib/reputation";

// Vercel Cron — runs daily at 3 AM UTC
// Protected by CRON_SECRET header
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dealerships = await prisma.dealership.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });

  let updated = 0;
  for (const d of dealerships) {
    try {
      await calculateReputationScore(d.id);
      updated++;
    } catch {
      // continue on error
    }
  }

  return NextResponse.json({ updated, total: dealerships.length });
}
