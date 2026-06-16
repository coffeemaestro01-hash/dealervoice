import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";
import { deleteCachePattern } from "@/lib/redis";

const patchSchema = z.object({
  featuredBadgeEnabled: z.boolean(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const existing = await prisma.dealership.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, slug: true, featuredBadgeEnabled: true },
  });
  if (!existing) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  const dealer = await prisma.dealership.update({
    where: { id },
    data: { featuredBadgeEnabled: parsed.data.featuredBadgeEnabled },
    select: { id: true, slug: true, featuredBadgeEnabled: true },
  });

  await deleteCachePattern(`dealership:${existing.slug}*`).catch(() => {});

  await logAdminAction({
    userId: session.user.id,
    action: "dealership.featured_badge_toggle",
    resource: "Dealership",
    resourceId: id,
    oldValues: { featuredBadgeEnabled: existing.featuredBadgeEnabled },
    newValues: parsed.data,
  });

  return NextResponse.json({ data: dealer });
}
