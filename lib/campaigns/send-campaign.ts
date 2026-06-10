import prisma from "@/lib/db";
import { Resend } from "resend";
import type { EmailCampaignAudience, EmailCampaignStatus } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "DealerVoice <dealers@dealervoice.io>";

type SendInput = {
  campaignId: string;
  subject: string;
  bodyHtml: string;
  audience: EmailCampaignAudience;
  countryId?: string;
  limit: number;
};

export async function sendEmailCampaign(input: SendInput) {
  const where: Record<string, unknown> = {
    deletedAt: null,
    email: { not: null },
    ...(input.countryId ? { countryId: input.countryId } : {}),
    ...(input.audience === "UNCLAIMED" ? { claimedAt: null } : {}),
    ...(input.audience === "CLAIMED" ? { claimedAt: { not: null } } : {}),
  };

  const dealers = await prisma.dealership.findMany({
    where,
    take: input.limit,
    select: { id: true, name: true, email: true, slug: true },
  });

  const recipients = dealers
    .map((d) => ({ dealershipId: d.id, email: d.email! }))
    .filter((r) => r.email);

  await prisma.emailCampaign.update({
    where: { id: input.campaignId },
    data: {
      status: "SENDING" as EmailCampaignStatus,
      recipientCount: recipients.length,
    },
  });

  if (recipients.length === 0) {
    await prisma.emailCampaign.update({
      where: { id: input.campaignId },
      data: { status: "FAILED" },
    });
    return { sent: 0, total: 0, failed: true };
  }

  let sent = 0;
  for (const r of recipients) {
    try {
      const result = await resend.emails.send({
        from: FROM,
        to: r.email,
        subject: input.subject,
        html: wrapCampaignHtml(input.bodyHtml, input.campaignId),
        tags: [{ name: "campaign_id", value: input.campaignId }],
      });
      await prisma.campaignRecipient.create({
        data: {
          campaignId: input.campaignId,
          dealershipId: r.dealershipId,
          email: r.email,
          resendId: result.data?.id ?? null,
          sentAt: new Date(),
        },
      });
      sent++;
    } catch {
      await prisma.campaignRecipient.create({
        data: {
          campaignId: input.campaignId,
          dealershipId: r.dealershipId,
          email: r.email,
          sentAt: null,
        },
      });
    }
  }

  await prisma.emailCampaign.update({
    where: { id: input.campaignId },
    data: {
      status: sent > 0 ? "SENT" : "FAILED",
      sentCount: sent,
      sentAt: new Date(),
    },
  });

  return { sent, total: recipients.length, failed: sent === 0 };
}

function wrapCampaignHtml(body: string, campaignId: string) {
  const base = body.includes("<") ? body : `<p>${body.replace(/\n/g, "<br/>")}</p>`;
  return `<div style="font-family:sans-serif;line-height:1.6;max-width:600px;margin:0 auto">${base}
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
    <p style="font-size:11px;color:#888">DealerVoice · <a href="https://dealervoice.io/unsubscribe?campaign=${campaignId}">Unsubscribe</a></p>
  </div>`;
}