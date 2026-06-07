import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isSuperAdmin } from "@/lib/admin/guards";
import { logAdminAction } from "@/lib/admin/audit";
import { deleteCachePattern } from "@/lib/redis";

const adminSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING_CLAIM", "CLAIMED", "SUSPENDED"]).optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// Admin-only moderation actions on a dealership (feature / verify / suspend).
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = adminSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing valid to update" }, { status: 422 });
  }

  const existing = await prisma.dealership.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  const dealer = await prisma.dealership.update({
    where: { id },
    data: parsed.data,
    select: { id: true, status: true, isFeatured: true, isVerified: true },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "dealership.admin_update",
    resource: "Dealership",
    resourceId: id,
    newValues: parsed.data,
  });

  return NextResponse.json({ data: dealer });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const dealer = await prisma.dealership.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, slug: true, name: true },
  });
  if (!dealer) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  await prisma.dealership.update({
    where: { id },
    data: { deletedAt: new Date(), status: "INACTIVE" },
  });

  await deleteCachePattern(`dealership:${dealer.slug}*`).catch(() => {});

  await logAdminAction({
    userId: session.user.id,
    action: "dealership.admin_delete",
    resource: "Dealership",
    resourceId: id,
    oldValues: { name: dealer.name, slug: dealer.slug },
  });

  return NextResponse.json({ message: "Dealership removed" });
}
