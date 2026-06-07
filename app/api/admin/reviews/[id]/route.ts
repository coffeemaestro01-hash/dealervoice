import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isAdminRole } from "@/lib/admin/guards";
import { deleteCachePattern } from "@/lib/redis";

const patchSchema = z.object({
  status: z.enum(["PUBLISHED", "REMOVED", "FLAGGED", "UNDER_REVIEW", "PENDING"]),
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, dealershipId: true, status: true, dealership: { select: { slug: true } } },
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const updated = await prisma.review.update({
    where: { id },
    data: {
      status: parsed.data.status,
      isFlagged: parsed.data.status === "FLAGGED",
      ...(parsed.data.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      ...(parsed.data.status === "REMOVED" ? { deletedAt: new Date() } : { deletedAt: null }),
    },
    select: { id: true, status: true },
  });

  const modType =
    parsed.data.status === "REMOVED"
      ? "REVIEW_REMOVED"
      : parsed.data.status === "PUBLISHED"
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

  return NextResponse.json({ data: updated });
}
