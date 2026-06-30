import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateInboxDraft } from "@/lib/inbox/ai";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";

const draftSchema = z.object({
  ticketId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { dealershipId } = await requireInboxSession();
    const parsed = draftSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const ticket = await prisma.inboxTicket.findFirst({
      where: { id: parsed.data.ticketId, dealershipId },
      include: {
        messages: { where: { direction: "INBOUND" }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [dealership, templates] = await Promise.all([
      prisma.dealership.findUnique({ where: { id: dealershipId }, select: { name: true } }),
      prisma.inboxCannedResponse.findMany({
        where: { dealershipId, isActive: true },
        take: 8,
        select: { title: true, body: true },
      }),
    ]);

    const draft = await generateInboxDraft({
      dealershipName: dealership?.name ?? "Dealership",
      ticketSubject: ticket.subject,
      customerMessage: ticket.messages[0]?.body ?? ticket.subject,
      templates,
    });

    return NextResponse.json({ data: draft });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
