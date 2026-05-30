import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { reviewResponseSchema } from "@/lib/validations";
import { deleteCachePattern } from "@/lib/redis";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const review = await prisma.review.findUnique({
    where: { id, deletedAt: null },
    include: { dealership: { include: { staff: { where: { userId: session.user.id, isActive: true } } } } },
  });

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const isDealerStaff = review.dealership.staff.length > 0;
  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);

  if (!isDealerStaff && !isAdmin) {
    return NextResponse.json({ error: "Only dealership staff can respond to reviews" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = reviewResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  // Upsert response
  const response = await prisma.reviewResponse.upsert({
    where: { reviewId: id },
    create: {
      reviewId: id,
      dealershipId: review.dealershipId,
      respondedById: session.user.id,
      body: parsed.data.body,
      isResolved: parsed.data.isResolved ?? false,
    },
    update: {
      body: parsed.data.body,
      isResolved: parsed.data.isResolved ?? false,
      resolvedAt: parsed.data.isResolved ? new Date() : null,
      updatedAt: new Date(),
    },
  });

  // Update dealer response rate
  await updateResponseRate(review.dealershipId);
  await deleteCachePattern(`dealership:${review.dealership.slug}*`);

  return NextResponse.json({ data: response });
}

async function updateResponseRate(dealershipId: string) {
  const [total, responded] = await Promise.all([
    prisma.review.count({ where: { dealershipId, status: "PUBLISHED", deletedAt: null } }),
    prisma.review.count({ where: { dealershipId, status: "PUBLISHED", deletedAt: null, response: { isNot: null } } }),
  ]);
  if (total > 0) {
    await prisma.dealership.update({
      where: { id: dealershipId },
      data: { responseRate: responded / total },
    });
  }
}
