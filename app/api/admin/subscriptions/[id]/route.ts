import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isSuperAdmin } from "@/lib/admin/guards";
import { logAdminAction } from "@/lib/admin/audit";

const patchSchema = z.object({
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
  status: z.enum(["ACTIVE", "CANCELED", "PAST_DUE", "TRIALING", "PAUSED"]).optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing valid to update" }, { status: 422 });
  }

  const existing = await prisma.dealerSubscription.findUnique({
    where: { id },
    select: { id: true, dealershipId: true, plan: true, status: true },
  });
  if (!existing) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "CANCELED") {
    data.canceledAt = new Date();
    data.cancelAtPeriodEnd = false;
  }
  if (parsed.data.plan && parsed.data.plan !== "FREE") {
    data.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const updated = await prisma.dealerSubscription.update({
    where: { id },
    data,
    include: { dealership: { select: { id: true, name: true, slug: true } } },
  });

  const isPremium = ["PRO", "ENTERPRISE"].includes(updated.plan) && updated.status === "ACTIVE";
  await prisma.dealership.update({
    where: { id: existing.dealershipId },
    data: { isPremiumClaimed: isPremium },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "subscription.admin_update",
    resource: "DealerSubscription",
    resourceId: id,
    oldValues: { plan: existing.plan, status: existing.status },
    newValues: parsed.data,
  });

  return NextResponse.json({ data: updated });
}
