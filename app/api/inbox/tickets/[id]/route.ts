import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { formatInboxTicketId } from "@/lib/inbox/constants";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["NEW", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { dealershipId } = await requireInboxSession();
    const { id } = await ctx.params;

    const ticket = await prisma.inboxTicket.findFirst({
      where: { id, dealershipId },
      include: {
        contact: true,
        assignee: { select: { id: true, name: true, email: true } },
        connection: { select: { id: true, address: true, provider: true, status: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true } } } },
        events: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: { ...ticket, displayId: formatInboxTicketId(ticket.ticketNumber) },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { dealershipId, userId } = await requireInboxSession();
    const { id } = await ctx.params;

    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const existing = await prisma.inboxTicket.findFirst({
      where: { id, dealershipId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (parsed.data.assigneeId) {
      const staff = await prisma.dealerStaff.findFirst({
        where: { dealershipId, userId: parsed.data.assigneeId, isActive: true },
      });
      if (!staff) {
        return NextResponse.json({ error: "Assignee not found" }, { status: 422 });
      }
    }

    const data: {
      status?: typeof parsed.data.status;
      priority?: typeof parsed.data.priority;
      assignedToId?: string | null;
      tags?: string[];
      resolvedAt?: Date | null;
    } = {};

    if (parsed.data.status !== undefined) {
      data.status = parsed.data.status;
      if (parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED") {
        data.resolvedAt = new Date();
      } else if (existing.resolvedAt) {
        data.resolvedAt = null;
      }
    }
    if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
    if (parsed.data.assigneeId !== undefined) data.assignedToId = parsed.data.assigneeId;
    if (parsed.data.tags !== undefined) data.tags = parsed.data.tags;

    const ticket = await prisma.inboxTicket.update({
      where: { id },
      data,
      include: {
        contact: true,
        assignee: { select: { id: true, name: true } },
      },
    });

    await prisma.inboxTicketEvent.create({
      data: {
        ticketId: id,
        actorId: userId,
        type: "ticket.updated",
        payload: parsed.data,
      },
    });

    return NextResponse.json({
      data: { ...ticket, displayId: formatInboxTicketId(ticket.ticketNumber) },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
