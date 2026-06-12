import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getIncomeDashboard, recordIncome } from "@/lib/income/ledger";
import { z } from "zod";
import type { IncomeSource, IncomeStatus } from "@prisma/client";

const createSchema = z.object({
  source: z.enum([
    "SUBSCRIPTION",
    "SPONSORSHIP",
    "AFFILIATE_CLICK",
    "AFFILIATE_PAYOUT",
    "ADSENSE",
    "LEAD_FEE",
    "INVENTORY_FEE",
    "OTHER",
  ]),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["ESTIMATED", "CONFIRMED", "PAID", "VOID"]).default("CONFIRMED"),
  countryCode: z.string().length(2).optional(),
  dealershipId: z.string().cuid().optional(),
  description: z.string().max(500),
  externalRef: z.string().max(200).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  const stats = await getIncomeDashboard(days);
  return NextResponse.json({ data: stats });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const record = await recordIncome({
    source: parsed.data.source as IncomeSource,
    status: parsed.data.status as IncomeStatus,
    amountMinor: parsed.data.amountMinor,
    currency: parsed.data.currency,
    countryCode: parsed.data.countryCode,
    dealershipId: parsed.data.dealershipId,
    description: parsed.data.description,
    externalRef: parsed.data.externalRef,
    periodStart: parsed.data.periodStart ? new Date(parsed.data.periodStart) : undefined,
    periodEnd: parsed.data.periodEnd ? new Date(parsed.data.periodEnd) : undefined,
    recordedById: session.user.id,
  });

  return NextResponse.json({ data: record }, { status: 201 });
}
