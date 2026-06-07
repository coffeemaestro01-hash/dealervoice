import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isStaffRole } from "@/lib/admin/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [claims, reports, leads, flaggedReviews, dsrOpen] = await Promise.all([
    prisma.dealerClaim.findMany({
      where: { status: { in: ["PENDING", "DOCUMENTS_REQUIRED"] } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        dealership: { select: { name: true, slug: true } },
        submittedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        reportedBy: { select: { name: true } },
        review: { select: { title: true } },
        dealership: { select: { name: true } },
      },
    }),
    prisma.lead.findMany({
      where: { status: "NEW" },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { dealership: { select: { name: true } } },
    }),
    prisma.review.findMany({
      where: { status: "FLAGGED" },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        dealership: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.dsrRequest.findMany({
      where: { status: { in: ["submitted", "verifying", "in_progress"] } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return NextResponse.json({
    data: {
      claims,
      reports,
      leads,
      flaggedReviews,
      dsrOpen,
      counts: {
        claims: claims.length,
        reports: reports.length,
        leads: leads.length,
        flaggedReviews: flaggedReviews.length,
        dsr: dsrOpen.length,
      },
    },
  });
}
