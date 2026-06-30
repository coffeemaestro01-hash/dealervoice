import prisma from "@/lib/db";
import type { InboxEmailProvider, InboxTicketChannel, InboxTicketPriority } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { runInboxAutomations } from "@/lib/inbox/automation";

export async function upsertInboxContact(
  dealershipId: string,
  input: { email: string; name?: string; phone?: string; vehicleInfo?: string }
) {
  const email = input.email.trim().toLowerCase();
  return prisma.inboxContact.upsert({
    where: { dealershipId_email: { dealershipId, email } },
    create: {
      dealershipId,
      email,
      name: input.name?.trim() || null,
      phone: input.phone?.trim() || null,
      vehicleInfo: input.vehicleInfo?.trim() || null,
      tags: [],
    },
    update: {
      name: input.name?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      vehicleInfo: input.vehicleInfo?.trim() || undefined,
    },
  });
}

export async function createInboxTicket(input: {
  dealershipId: string;
  subject: string;
  body: string;
  fromEmail: string;
  fromName?: string;
  channel?: InboxTicketChannel;
  priority?: InboxTicketPriority;
  connectionId?: string;
  tags?: string[];
}) {
  const contact = await upsertInboxContact(input.dealershipId, {
    email: input.fromEmail,
    name: input.fromName,
  });

  const connection = input.connectionId
    ? await prisma.inboxEmailConnection.findFirst({
        where: { id: input.connectionId, dealershipId: input.dealershipId },
      })
    : await prisma.inboxEmailConnection.findFirst({
        where: { dealershipId: input.dealershipId, status: "CONNECTED" },
      });

  const ticket = await prisma.inboxTicket.create({
    data: {
      dealershipId: input.dealershipId,
      subject: input.subject.trim(),
      contactId: contact.id,
      connectionId: connection?.id,
      channel: input.channel ?? "EMAIL",
      priority: input.priority ?? "MEDIUM",
      tags: input.tags ?? [],
      status: "NEW",
    },
  });

  await prisma.inboxMessage.create({
    data: {
      ticketId: ticket.id,
      body: input.body,
      from: input.fromName ? `${input.fromName} <${input.fromEmail}>` : input.fromEmail,
      to: connection?.address ?? "support",
      direction: "INBOUND",
    },
  });

  await prisma.inboxTicketEvent.create({
    data: { ticketId: ticket.id, type: "ticket.created", payload: { channel: ticket.channel } },
  });

  await runInboxAutomations("ticket.created", ticket.id);

  return prisma.inboxTicket.findUnique({
    where: { id: ticket.id },
    include: {
      contact: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function replyToInboxTicket(input: {
  ticketId: string;
  dealershipId: string;
  authorId: string;
  body: string;
  toEmail: string;
  fromAddress: string;
}) {
  const ticket = await prisma.inboxTicket.findFirst({
    where: { id: input.ticketId, dealershipId: input.dealershipId },
  });
  if (!ticket) throw new Error("Ticket not found");

  const msg = await prisma.inboxMessage.create({
    data: {
      ticketId: ticket.id,
      body: input.body,
      from: input.fromAddress,
      to: input.toEmail,
      direction: "OUTBOUND",
      authorId: input.authorId,
    },
  });

  const updates: { firstResponseAt?: Date; status?: "OPEN" | "IN_PROGRESS" } = {};
  if (!ticket.firstResponseAt) updates.firstResponseAt = new Date();
  if (ticket.status === "NEW") updates.status = "OPEN";

  await prisma.inboxTicket.update({
    where: { id: ticket.id },
    data: updates,
  });

  await prisma.inboxTicketEvent.create({
    data: { ticketId: ticket.id, actorId: input.authorId, type: "message.sent", payload: { messageId: msg.id } },
  });

  return msg;
}

export async function updateInboxConnection(
  dealershipId: string,
  data: {
    provider?: InboxEmailProvider;
    address?: string;
    status?: "PENDING" | "CONNECTED" | "ERROR" | "DISCONNECTED";
    config?: Record<string, unknown>;
    lastError?: string | null;
  }
) {
  const existing = await prisma.inboxEmailConnection.findFirst({
    where: { dealershipId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return prisma.inboxEmailConnection.update({
      where: { id: existing.id },
      data: {
        provider: data.provider,
        address: data.address,
        status: data.status,
        config: (data.config ?? undefined) as Prisma.InputJsonValue | undefined,
        lastError: data.lastError,
        connectedAt: data.status === "CONNECTED" ? new Date() : undefined,
      },
    });
  }

  return prisma.inboxEmailConnection.create({
    data: {
      dealershipId,
      provider: data.provider ?? "OTHER",
      address: data.address,
      status: data.status ?? "PENDING",
      config: (data.config ?? {}) as Prisma.InputJsonValue,
    },
  });
}
