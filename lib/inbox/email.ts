import { Resend } from "resend";
import prisma from "@/lib/db";
import { EMAILS } from "@/lib/constants/emails";
import { formatInboxTicketId } from "@/lib/inbox/constants";
import { buildInboxInboundAddress } from "@/lib/inbox/email-address";

/** Verified Resend sender (send.dealervoice.io on free plan). Override with EMAIL_FROM in production. */
const DEFAULT_INBOX_SEND_ADDRESS = "noreply@send.dealervoice.io";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

/** Resend-verified From line with dealership branding. */
export function buildInboxVerifiedFromAddress(dealershipName: string): string {
  const safeName = dealershipName.replace(/[<>"]/g, "").trim() || "DealerVoice";
  const branded = `${safeName} via DealerVoice`;

  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) {
    const match = configured.match(/^(.+?)\s*<([^>]+)>$/);
    if (match) return `${branded} <${match[2].trim()}>`;
    if (configured.includes("@")) return `${branded} <${configured}>`;
  }

  const sendAddress =
    process.env.INBOX_SEND_FROM?.trim() || DEFAULT_INBOX_SEND_ADDRESS;
  return `${branded} <${sendAddress}>`;
}

function resolveInboxReplyTo(dealerSupportAddress?: string | null): string {
  return (
    dealerSupportAddress?.trim() ||
    process.env.INBOX_REPLY_TO?.trim() ||
    EMAILS.support
  );
}

export async function ensureDealershipInboundAddress(dealershipId: string): Promise<string> {
  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    select: { slug: true },
  });
  if (!dealership) throw new Error("Dealership not found");

  const inboundAddress = buildInboxInboundAddress(dealership.slug);
  const existing = await prisma.inboxEmailConnection.findFirst({
    where: { dealershipId },
    orderBy: { createdAt: "asc" },
  });

  const priorConfig =
    existing?.config && typeof existing.config === "object" && !Array.isArray(existing.config)
      ? (existing.config as Record<string, unknown>)
      : {};

  if (existing) {
    if (priorConfig.inboundAddress === inboundAddress) return inboundAddress;
    await prisma.inboxEmailConnection.update({
      where: { id: existing.id },
      data: {
        config: { ...priorConfig, inboundAddress },
      },
    });
    return inboundAddress;
  }

  await prisma.inboxEmailConnection.create({
    data: {
      dealershipId,
      status: "PENDING",
      config: { inboundAddress },
    },
  });
  return inboundAddress;
}

export async function sendInboxOutboundEmail(input: {
  messageId: string;
  ticketId: string;
  dealershipId: string;
  toEmail: string;
  body: string;
  subject: string;
  ticketNumber: number;
  dealerReplyTo?: string | null;
}): Promise<{ externalId: string | null; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { externalId: null, error: "Email sending is not configured (RESEND_API_KEY missing)" };
  }

  const [dealership, ticket, connection] = await Promise.all([
    prisma.dealership.findUnique({
      where: { id: input.dealershipId },
      select: { name: true },
    }),
    prisma.inboxTicket.findFirst({
      where: { id: input.ticketId, dealershipId: input.dealershipId },
      include: {
        messages: {
          where: { externalId: { not: null } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.inboxEmailConnection.findFirst({
      where: { dealershipId: input.dealershipId },
      select: { address: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!dealership || !ticket) {
    return { externalId: null, error: "Ticket or dealership not found" };
  }

  const displayId = formatInboxTicketId(input.ticketNumber);
  const subject = input.subject.includes(displayId)
    ? input.subject
    : `Re: [${displayId}] ${input.subject.replace(/^Re:\s*/i, "")}`;

  const references = ticket.messages
    .map((m) => m.externalId)
    .filter(Boolean)
    .map((id) => `<${id}>`);

  const headers: Record<string, string> = {
    "X-DealerVoice-Ticket": displayId,
  };
  if (references.length > 0) {
    headers["In-Reply-To"] = references[0]!;
    headers.References = references.join(" ");
  }

  const replyTo = resolveInboxReplyTo(input.dealerReplyTo ?? connection?.address);

  try {
    const result = await getResend().emails.send({
      from: buildInboxVerifiedFromAddress(dealership.name),
      to: input.toEmail,
      subject,
      text: input.body,
      headers,
      reply_to: replyTo,
    });

    const externalId = result.data?.id ?? null;
    if (externalId) {
      await prisma.inboxMessage.update({
        where: { id: input.messageId },
        data: { externalId },
      });
    }

    if (result.error) {
      return { externalId, error: result.error.message };
    }

    return { externalId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { externalId: null, error: message };
  }
}
