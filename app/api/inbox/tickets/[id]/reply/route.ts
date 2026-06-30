import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { replyToInboxTicket } from "@/lib/inbox/tickets";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { sendInboxOutboundEmail } from "@/lib/inbox/email";
import { z } from "zod";

const replySchema = z.object({
  body: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { dealershipId, userId } = await requireInboxSession();
    const { id } = await ctx.params;

    const parsed = replySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const ticket = await prisma.inboxTicket.findFirst({
      where: { id, dealershipId },
      include: {
        contact: true,
        connection: true,
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const connection =
      ticket.connection ??
      (await prisma.inboxEmailConnection.findFirst({
        where: { dealershipId, status: "CONNECTED" },
      }));

    const fromAddress = connection?.address ?? "support@dealervoice.io";
    const dealership = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      select: { name: true },
    });
    const fromLabel = dealership?.name ? `${dealership.name} <${fromAddress}>` : fromAddress;

    const message = await replyToInboxTicket({
      ticketId: id,
      dealershipId,
      authorId: userId,
      body: parsed.data.body,
      toEmail: ticket.contact.email,
      fromAddress: fromLabel,
    });

    const sendResult = await sendInboxOutboundEmail({
      messageId: message.id,
      ticketId: ticket.id,
      dealershipId,
      toEmail: ticket.contact.email,
      body: parsed.data.body,
      subject: ticket.subject,
      ticketNumber: ticket.ticketNumber,
    });

    return NextResponse.json(
      {
        data: message,
        email: {
          sent: Boolean(sendResult.externalId),
          externalId: sendResult.externalId,
          error: sendResult.error ?? null,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
