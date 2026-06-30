import { DealerStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { planAmountCents } from "@/lib/payment";

const ACTIVE_DEALER_STATUSES: DealerStatus[] = ["ACTIVE", "CLAIMED"];

export async function getRevenueStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    paidInvoices,
    confirmedIncome,
    proCount,
    proPlusCount,
    enterpriseCount,
    freeCount,
    claimedDealers,
    premiumDealers,
    claimsPending,
    claimsApproved30d,
    leads30d,
    leadsConverted30d,
  ] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.incomeRecord.aggregate({
      _sum: { amountMinor: true },
      where: { status: { in: ["CONFIRMED", "PAID"] } },
    }),
    prisma.dealerSubscription.count({ where: { plan: "PRO", status: "ACTIVE" } }),
    prisma.dealerSubscription.count({ where: { plan: "PRO_PLUS", status: "ACTIVE" } }),
    prisma.dealerSubscription.count({ where: { plan: "ENTERPRISE", status: "ACTIVE" } }),
    prisma.dealerSubscription.count({ where: { plan: "FREE" } }),
    prisma.dealership.count({ where: { claimedAt: { not: null }, deletedAt: null } }),
    prisma.dealership.count({ where: { isPremiumClaimed: true, deletedAt: null } }),
    prisma.dealerClaim.count({ where: { status: "PENDING" } }),
    prisma.dealerClaim.count({ where: { status: "APPROVED", reviewedAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { status: "CONVERTED", updatedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const mrrEstimate =
    proCount * planAmountCents("PRO", "monthly") +
    proPlusCount * planAmountCents("PRO_PLUS", "monthly") +
    enterpriseCount * planAmountCents("ENTERPRISE", "monthly");

  return {
    totalRevenue: (paidInvoices._sum.amount ?? 0) / 100,
    confirmedRevenue: (confirmedIncome._sum.amountMinor ?? 0) / 100,
    mrrEstimate: mrrEstimate / 100,
    proCount,
    proPlusCount,
    enterpriseCount,
    freeCount,
    claimedDealers,
    premiumDealers,
    claimToPayRate: claimedDealers > 0 ? Math.round((premiumDealers / claimedDealers) * 100) : 0,
    claimsPending,
    claimsApproved30d,
    leads30d,
    leadsConverted30d,
    leadConversionRate: leads30d > 0 ? Math.round((leadsConverted30d / leads30d) * 100) : 0,
  };
}

export async function getDataQualityStats() {
  const base = { deletedAt: null, status: { in: ACTIVE_DEALER_STATUSES } };
  const [total, noReviews, noPhone, noWebsite, noEmail, unclaimed] = await Promise.all([
    prisma.dealership.count({ where: base }),
    prisma.dealership.count({ where: { ...base, totalReviews: 0 } }),
    prisma.dealership.count({ where: { ...base, OR: [{ phone: null }, { phone: "" }] } }),
    prisma.dealership.count({ where: { ...base, OR: [{ website: null }, { website: "" }] } }),
    prisma.dealership.count({ where: { ...base, OR: [{ email: null }, { email: "" }] } }),
    prisma.dealership.count({ where: { ...base, claimedAt: null } }),
  ]);
  return { total, noReviews, noPhone, noWebsite, noEmail, unclaimed };
}

export async function getGeoCoverage() {
  return prisma.country.findMany({
    orderBy: { dealerCount: "desc" },
    select: {
      id: true,
      name: true,
      code: true,
      dealerCount: true,
      cities: { select: { id: true, name: true, dealerCount: true }, orderBy: { dealerCount: "desc" }, take: 5 },
    },
  });
}
