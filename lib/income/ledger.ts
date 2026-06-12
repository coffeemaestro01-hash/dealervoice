import prisma from "@/lib/db";
import type { IncomeSource, IncomeStatus, Prisma } from "@prisma/client";

export interface RecordIncomeInput {
  source: IncomeSource;
  amountMinor: number;
  currency?: string;
  status?: IncomeStatus;
  countryCode?: string | null;
  dealershipId?: string | null;
  description?: string;
  externalRef?: string;
  periodStart?: Date;
  periodEnd?: Date;
  metadata?: Prisma.InputJsonValue;
  recordedById?: string;
}

/** Idempotent income write — skips duplicate externalRef per source. */
export async function recordIncome(input: RecordIncomeInput) {
  if (input.externalRef) {
    const existing = await prisma.incomeRecord.findUnique({
      where: { source_externalRef: { source: input.source, externalRef: input.externalRef } },
    });
    if (existing) return existing;
  }

  return prisma.incomeRecord.create({
    data: {
      source: input.source,
      status: input.status ?? "ESTIMATED",
      amountMinor: input.amountMinor,
      currency: input.currency ?? "USD",
      countryCode: input.countryCode?.toUpperCase() ?? null,
      dealershipId: input.dealershipId ?? null,
      description: input.description,
      externalRef: input.externalRef ?? null,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      metadata: input.metadata,
      recordedById: input.recordedById ?? null,
    },
  });
}

export interface IncomeDashboardStats {
  days: number;
  totalsBySource: { source: IncomeSource; amountMinor: number; count: number }[];
  totalsByStatus: { status: IncomeStatus; amountMinor: number; count: number }[];
  totalsByCountry: { countryCode: string; amountMinor: number; count: number }[];
  grandTotalMinor: number;
  confirmedTotalMinor: number;
  estimatedTotalMinor: number;
  recent: Awaited<ReturnType<typeof prisma.incomeRecord.findMany>>;
}

export async function getIncomeDashboard(days = 30): Promise<IncomeDashboardStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.incomeRecord.findMany({
    where: { createdAt: { gte: since }, status: { not: "VOID" } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { dealership: { select: { name: true, slug: true } } },
  });

  const all = await prisma.incomeRecord.groupBy({
    by: ["source"],
    where: { createdAt: { gte: since }, status: { not: "VOID" } },
    _sum: { amountMinor: true },
    _count: true,
  });

  const byStatus = await prisma.incomeRecord.groupBy({
    by: ["status"],
    where: { createdAt: { gte: since } },
    _sum: { amountMinor: true },
    _count: true,
  });

  const byCountry = await prisma.incomeRecord.groupBy({
    by: ["countryCode"],
    where: { createdAt: { gte: since }, status: { not: "VOID" }, countryCode: { not: null } },
    _sum: { amountMinor: true },
    _count: true,
  });

  const grandTotalMinor = all.reduce((s, r) => s + (r._sum.amountMinor ?? 0), 0);
  const confirmedTotalMinor =
    byStatus.find((r) => r.status === "CONFIRMED" || r.status === "PAID")?._sum.amountMinor ?? 0;
  const estimatedTotalMinor = byStatus.find((r) => r.status === "ESTIMATED")?._sum.amountMinor ?? 0;

  return {
    days,
    totalsBySource: all.map((r) => ({
      source: r.source,
      amountMinor: r._sum.amountMinor ?? 0,
      count: r._count,
    })),
    totalsByStatus: byStatus.map((r) => ({
      status: r.status,
      amountMinor: r._sum.amountMinor ?? 0,
      count: r._count,
    })),
    totalsByCountry: byCountry
      .filter((r) => r.countryCode)
      .map((r) => ({
        countryCode: r.countryCode!,
        amountMinor: r._sum.amountMinor ?? 0,
        count: r._count,
      })),
    grandTotalMinor,
    confirmedTotalMinor,
    estimatedTotalMinor,
    recent: records,
  };
}

export function formatIncomeMinor(amountMinor: number, currency = "USD"): string {
  const major = amountMinor / 100;
  if (currency === "INR") return `₹${major.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
}
