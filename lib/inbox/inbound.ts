import prisma from "@/lib/db";
import { PAID_INBOX_PLANS } from "@/lib/inbox/constants";
import { getEffectiveInboxPlan } from "@/lib/inbox/access";
import {
  parseSlugFromInboundAddress,
  parseTicketNumberFromSubject,
} from "@/lib/inbox/email-address";
import { createInboxTicket } from "@/lib/inbox/tickets";
import { runInboxAutomations } from "@/lib/inbox/automation";

export type InboundEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  messageId?: string;
};

function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim().toLowerCase() };
  }
  return { email: from.trim().toLowerCase() };
}

async function resolveDealershipFromRecipients(to: string[]): Promise<{
  dealershipId: string;
  connectionId: string | null;
} | null> {
  for (const raw of to) {
    const slug = parseSlugFromInboundAddress(raw);
    if (!slug) continue;
    const dealership = await prisma.dealership.findFirst({
      where: { slug, status: "ACTIVE" },
      select: { id: true },
    });
    if (!dealership) continue;

    const effective = await getEffectiveInboxPlan(dealership.id);
    if (!PAID_INBOX_PLANS.includes(effective.plan)) continue;

    const connection = await prisma.inboxEmailConnection.findFirst({
      where: { dealershipId: dealership.id },
      orderBy: { createdAt: "asc" },
    });

    return { dealershipId: dealership.id, connectionId: connection?.id ?? null };
  }
  return null;
}

export async function processInboundInboxEmail(payload: InboundEmailPayload) {
  const resolved = await resolveDealershipFromRecipients(payload.to);
  if (!resolved) {
    return { ok: false as const, reason: "unknown_recipient" };
  }

  const { email, name } = parseFromAddress(payload.from);
  const body = (payload.text || payload.html || "").trim();
  if (!body) {
    return { ok: false as const, reason: "empty_body" };
  }

  const ticketNumber = parseTicketNumberFromSubject(payload.subject);
  if (ticketNumber != null) {
    const existing = await prisma.inboxTicket.findFirst({
      where: { ticketNumber, dealershipId: resolved.dealershipId },
      include: { contact: true },
    });
    if (existing) {
      const msg = await prisma.inboxMessage.create({
        data: {
          ticketId: existing.id,
          body,
          bodyHtml: payload.html ?? null,
          from: payload.from,
          to: payload.to.join(", "),
          direction: "INBOUND",
          externalId: payload.messageId ?? null,
        },
      });

      await prisma.inboxTicket.update({
        where: { id: existing.id },
        data: {
          status: existing.status === "RESOLVED" || existing.status === "CLOSED" ? "OPEN" : existing.status,
        },
      });

      await prisma.inboxTicketEvent.create({
        data: {
          ticketId: existing.id,
          type: "message.received",
          payload: { messageId: msg.id, channel: "email" },
        },
      });

      await runInboxAutomations("message.received", existing.id);
      return { ok: true as const, ticketId: existing.id, threaded: true };
    }
  }

  const ticket = await createInboxTicket({
    dealershipId: resolved.dealershipId,
    subject: payload.subject.trim() || "Customer email",
    body,
    fromEmail: email,
    fromName: name,
    channel: "EMAIL",
    connectionId: resolved.connectionId ?? undefined,
    tags: ["email-inbound"],
  });

  if (!ticket) {
    return { ok: false as const, reason: "create_failed" };
  }

  if (payload.messageId) {
    const firstMsg = ticket.messages[0];
    if (firstMsg) {
      await prisma.inboxMessage.update({
        where: { id: firstMsg.id },
        data: { externalId: payload.messageId, bodyHtml: payload.html ?? null },
      });
    }
  }

  return { ok: true as const, ticketId: ticket.id, threaded: false };
}
