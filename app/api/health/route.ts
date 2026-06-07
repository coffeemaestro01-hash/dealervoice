import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = { api: "ok" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const count = await prisma.dealership.count({
      where: { deletedAt: null, status: { in: ["ACTIVE", "CLAIMED"] } },
    });
    checks.publicDealers = String(count);
  } catch {
    checks.publicDealers = "error";
  }

  const healthy = checks.database === "ok";
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
