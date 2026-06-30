import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getEffectiveInboxPlan } from "@/lib/inbox/access";
import { PAID_INBOX_PLANS, formatInboxTicketId } from "@/lib/inbox/constants";
import { createInboxTicket } from "@/lib/inbox/tickets";
import { z } from "zod";

const webFormSchema = z.object({
  slug: z.string().min(1).max(120),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(10000),
  email: z.string().email(),
  name: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = webFormSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
  }

  const dealership = await prisma.dealership.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, status: true },
  });
  if (!dealership || dealership.status !== "ACTIVE") {
    return NextResponse.json({ error: "Dealership not found" }, { status: 404 });
  }

  const effective = await getEffectiveInboxPlan(dealership.id);
  if (!PAID_INBOX_PLANS.includes(effective.plan)) {
    return NextResponse.json({ error: "Inbox not available" }, { status: 403 });
  }

  const ticket = await createInboxTicket({
    dealershipId: dealership.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
    fromEmail: parsed.data.email,
    fromName: parsed.data.name,
    channel: "WEB_FORM",
    tags: ["web-form"],
  });

  return NextResponse.json(
    {
      data: ticket
        ? { id: ticket.id, displayId: formatInboxTicketId(ticket.ticketNumber) }
        : null,
    },
    { status: 201 }
  );
}
