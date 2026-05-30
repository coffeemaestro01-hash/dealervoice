import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { reportSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  if (!parsed.data.reviewId && !parsed.data.dealerId) {
    return NextResponse.json({ error: "Either reviewId or dealerId is required" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reason: parsed.data.reason,
      description: parsed.data.description,
      reportedById: session.user.id,
      reviewId: parsed.data.reviewId,
      dealerId: parsed.data.dealerId,
    },
    select: { id: true },
  });

  // Increment report count on review
  if (parsed.data.reviewId) {
    const reportCount = await prisma.report.count({ where: { reviewId: parsed.data.reviewId } });
    if (reportCount >= 3) {
      await prisma.review.update({
        where: { id: parsed.data.reviewId },
        data: { status: "FLAGGED", isFlagged: true },
      });
    } else {
      await prisma.review.update({
        where: { id: parsed.data.reviewId },
        data: { reportCount: { increment: 1 } },
      });
    }
  }

  return NextResponse.json({ data: report, message: "Report submitted. Our team will review it." }, { status: 201 });
}

// Admin: list reports
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 20;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { status },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reportedBy: { select: { id: true, name: true, email: true } },
        review: { select: { id: true, title: true, status: true, dealershipId: true } },
        dealership: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.report.count({ where: { status } }),
  ]);

  return NextResponse.json({ data: reports, total, page, totalPages: Math.ceil(total / limit) });
}
