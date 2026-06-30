import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createInboxTicket } from "@/lib/inbox/tickets";
import { formatInboxTicketId } from "@/lib/inbox/constants";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";
import type { InboxTicketStatus } from "@prisma/client";

const PAGE_SIZE = 25;

const createSchema = z.object({
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(10000),
  fromEmail: z.string().email(),
  fromName: z.string().max(120).optional(),
  channel: z.enum(["PHONE", "WALK_IN", "OTHER", "EMAIL"]).default("OTHER"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { dealershipId } = await requireInboxSession();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as InboxTicketStatus | null;
    const q = searchParams.get("q")?.trim();
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const where = {
      dealershipId,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: "insensitive" as const } },
              { contact: { email: { contains: q, mode: "insensitive" as const } } },
              { contact: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [tickets, total] = await Promise.all([
      prisma.inboxTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          contact: { select: { id: true, email: true, name: true } },
          assignee: { select: { id: true, name: true } },
        },
      }),
      prisma.inboxTicket.count({ where }),
    ]);

    return NextResponse.json({
      data: tickets.map((t) => ({
        ...t,
        displayId: formatInboxTicketId(t.ticketNumber),
      })),
      meta: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dealershipId } = await requireInboxSession();
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const ticket = await createInboxTicket({
      dealershipId,
      subject: parsed.data.subject,
      body: parsed.data.body,
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName,
      channel: parsed.data.channel,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
    });

    return NextResponse.json(
      {
        data: ticket
          ? { ...ticket, displayId: formatInboxTicketId(ticket.ticketNumber) }
          : null,
      },
      { status: 201 }
    );
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
