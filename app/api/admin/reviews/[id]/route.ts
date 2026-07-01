import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isAdminRole } from "@/lib/admin/guards";
import { deleteCachePattern } from "@/lib/redis";
import { syncChicagoJackpotForDealership } from "@/lib/promotions/chicago-jackpot";
import { syncGiftCardForReview } from "@/lib/reviews/gift-cards";

const patchSchema = z.object({
  status: z.enum(["PUBLISHED", "REMOVED", "FLAGGED", "UNDER_REVIEW", "PENDING"]).optional(),
  verificationStatus: z.enum(["UNVERIFIED", "VERIFIED_PURCHASE", "VERIFIED_SERVICE", "PENDING"]).optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, dealershipId: true, status: true, dealership: { select: { slug: true } } },
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    updateData.isFlagged = parsed.data.status === "FLAGGED";
    if (parsed.data.status === "PUBLISHED") updateData.publishedAt = new Date();
    if (parsed.data.status === "REMOVED") updateData.deletedAt = new Date();
    else if (parsed.data.status) updateData.deletedAt = null;
  }
  if (parsed.data.verificationStatus) {
    updateData.verificationStatus = parsed.data.verificationStatus;
    if (parsed.data.verificationStatus.startsWith("VERIFIED")) {
      updateData.verifiedAt = new Date();
    }
  }

  const updated = await prisma.review.update({
    where: { id },
    data: updateData,
    select: { id: true, status: true, verificationStatus: true },
  });

  const modType =
    parsed.data.status === "REMOVED"
      ? "REVIEW_REMOVED"
      : parsed.data.status === "PUBLISHED"
        ? "REVIEW_APPROVED"
        : parsed.data.verificationStatus
          ? "REVIEW_APPROVED"
          : "FLAG_DISMISSED";

  await prisma.moderationAction.create({
    data: {
      type: modType,
      moderatorId: session.user.id,
      targetId: id,
      targetType: "review",
      reason: `Status set to ${parsed.data.status}`,
    },
  }).catch(() => {});

  await deleteCachePattern(`dealership:${review.dealership.slug}*`).catch(() => {});

  if (
    parsed.data.status === "PUBLISHED" ||
    parsed.data.verificationStatus?.startsWith("VERIFIED")
  ) {
    await syncChicagoJackpotForDealership(review.dealershipId).catch(() => {});
    await syncGiftCardForReview(id).catch(() => {});
  }

  return NextResponse.json({ data: updated });
}
