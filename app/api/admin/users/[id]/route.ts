import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { canManageUser, isAdminRole, isSuperAdmin } from "@/lib/admin/guards";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "PENDING_VERIFICATION"]).optional(),
  role: z.enum(["CUSTOMER", "DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN"]).optional(),
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
    return NextResponse.json({ error: "Nothing valid to update" }, { status: 422 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true, deletedAt: true },
  });
  if (!target || target.deletedAt) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const guard = canManageUser(
    { id: session.user.id, role: session.user.role as string },
    { id: target.id, role: target.role }
  );
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 403 });

  if (parsed.data.role) {
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Only super admins can change roles" }, { status: 403 });
    }
    if (parsed.data.role === "SUPER_ADMIN" && !isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Cannot assign super admin role" }, { status: 403 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (parsed.data.status === "BANNED" || parsed.data.status === "SUSPENDED") {
    await prisma.session.deleteMany({ where: { userId: id } }).catch(() => {});
  }

  const modType = parsed.data.status === "BANNED" ? "USER_BANNED" : "USER_SUSPENDED";
  if (parsed.data.status === "BANNED" || parsed.data.status === "SUSPENDED") {
    await prisma.moderationAction.create({
      data: {
        type: modType,
        moderatorId: session.user.id,
        targetId: id,
        targetType: "user",
        reason: `Status set to ${parsed.data.status}`,
      },
    }).catch(() => {});
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "user.admin_update",
      resource: "User",
      resourceId: id,
      newValues: parsed.data,
    },
  }).catch(() => {});

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Only super admins can remove users" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true, deletedAt: true },
  });
  if (!target || target.deletedAt) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const guard = canManageUser(
    { id: session.user.id, role: session.user.role as string },
    { id: target.id, role: target.role }
  );
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 403 });

  const removedEmail = `deleted+${id}@removed.dealervoice.io`;

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: id } }),
    prisma.account.deleteMany({ where: { userId: id } }),
    prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "BANNED",
        email: removedEmail,
        passwordHash: null,
        emailNotifications: false,
        marketingEmails: false,
      },
    }),
  ]);

  await prisma.moderationAction.create({
    data: {
      type: "USER_BANNED",
      moderatorId: session.user.id,
      targetId: id,
      targetType: "user",
      reason: "Account removed by admin",
      notes: `Former email: ${target.email}`,
    },
  }).catch(() => {});

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "user.admin_delete",
      resource: "User",
      resourceId: id,
      oldValues: { email: target.email },
      newValues: { deletedAt: new Date().toISOString(), email: removedEmail },
    },
  }).catch(() => {});

  return NextResponse.json({ message: "User removed" });
}
