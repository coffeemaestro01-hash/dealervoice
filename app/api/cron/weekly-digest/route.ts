import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendWeeklyDigest, type DigestStats } from "@/lib/email";

// Weekly digest to the administrator. Triggered by Vercel Cron (Mondays 08:00 UTC).
// Protected by CRON_SECRET. Manual run: GET with ?key=<CRON_SECRET>.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = process.env.DIGEST_EMAIL;
  if (!to) return NextResponse.json({ error: "DIGEST_EMAIL not configured" }, { status: 500 });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalDealers, totalUsers, totalReviews,
      newUsers7d, newReviews7d, pendingClaims, pendingReports,
      paidSubscriptions, revenueAgg, topDealers, recentClaims,
    ] = await Promise.all([
      prisma.dealership.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo }, deletedAt: null } }),
      prisma.review.count({ where: { createdAt: { gte: weekAgo }, status: "PUBLISHED" } }),
      prisma.dealerClaim.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.dealerSubscription.count({ where: { status: "ACTIVE", plan: { in: ["PRO", "ENTERPRISE"] } } }).catch(() => 0),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "paid" } }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.dealership.findMany({
        where: { totalReviews: { gt: 0 }, deletedAt: null },
        orderBy: [{ overallRating: "desc" }, { totalReviews: "desc" }],
        take: 5,
        select: { name: true, overallRating: true, totalReviews: true, slug: true },
      }),
      prisma.dealerClaim.findMany({
        where: { createdAt: { gte: weekAgo } },
        take: 5, orderBy: { createdAt: "desc" },
        include: { dealership: { select: { name: true } }, submittedBy: { select: { name: true } } },
      }).catch(() => []),
    ]);

    const stats: DigestStats = {
      periodLabel: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalDealers, totalUsers, totalReviews, newUsers7d, newReviews7d,
      pendingClaims, pendingReports, paidSubscriptions,
      revenueInr: Math.round(((revenueAgg as any)?._sum?.amount ?? 0) / 100),
      topDealers: topDealers.map((d) => ({ name: d.name, rating: d.overallRating, reviews: d.totalReviews, slug: d.slug })),
      recentClaims: (recentClaims as any[]).map((c) => ({ dealerName: c.dealership?.name ?? "—", by: c.submittedBy?.name ?? "—" })),
    };

    await sendWeeklyDigest(to, stats);
    return NextResponse.json({ ok: true, sentTo: to, stats });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
