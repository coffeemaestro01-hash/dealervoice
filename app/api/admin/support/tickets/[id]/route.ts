import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isStaffRole } from "@/lib/admin/permissions";
import { logAdminAction } from "@/lib/admin/audit";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminNotes: z.string().max(5000).optional(),
  reply: z.string().min(1).max(5000).optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 422 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.reply) {
    await prisma.supportTicketReply.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        body: parsed.data.reply,
        isStaff: true,
      },
    });
  }

  const updates: {
    status?: typeof parsed.data.status;
    adminNotes?: string;
    resolvedAt?: Date | null;
  } = {};

  if (parsed.data.status) {
    updates.status = parsed.data.status;
    updates.resolvedAt =
      parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED"
        ? new Date()
        : null;
  }
  if (parsed.data.adminNotes !== undefined) {
    updates.adminNotes = parsed.data.adminNotes;
  }

  const result = await prisma.supportTicket.update({
    where: { id },
    data: updates,
    include: {
      user: { select: { name: true, email: true } },
      dealership: { select: { name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "support_ticket.update",
    resource: "SupportTicket",
    resourceId: id,
    newValues: parsed.data,
  });

  return NextResponse.json({ data: result });
}
