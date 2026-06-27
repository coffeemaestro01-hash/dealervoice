import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdmitadAccessToken, isAdmitadConfigured, listAdmitadPrograms } from "@/lib/ads/admitad-api";
import { STRIPE_ENABLED } from "@/lib/payment";

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

  if (isAdmitadConfigured()) {
    checks.admitad = "configured";
    const token = await getAdmitadAccessToken();
    checks.admitadToken = token ? "ok" : "failed";
    if (token) {
      const programs = await listAdmitadPrograms(3);
      checks.admitadPrograms = programs.length > 0 ? `connected (${programs.length}+)` : "no_programs_yet";
    }
  } else {
    checks.admitad = "missing_env";
  }

  checks.stripe = STRIPE_ENABLED ? "configured" : "missing_env";
  checks.stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ? "configured" : "missing_env";
  checks.stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? "configured"
    : "missing_env";

  const healthy = checks.database === "ok";
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
