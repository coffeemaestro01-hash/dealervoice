import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/** Resend webhook — updates open/click/unsubscribe counts per campaign. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.type || !body?.data) {
    return NextResponse.json({ ok: true });
  }

  const emailId = body.data.email_id as string | undefined;
  const tags = (body.data.tags as { name: string; value: string }[] | undefined) ?? [];
  const campaignTag = tags.find((t) => t.name === "campaign_id");
  const campaignId = campaignTag?.value;

  let recipient = emailId
    ? await prisma.campaignRecipient.findFirst({ where: { resendId: emailId } })
    : null;

  if (!recipient && campaignId && body.data.to) {
    recipient = await prisma.campaignRecipient.findFirst({
      where: { campaignId, email: body.data.to as string },
    });
  }

  const cid = recipient?.campaignId ?? campaignId;
  if (!cid) return NextResponse.json({ ok: true });

  const type = body.type as string;

  if (type === "email.opened" && recipient && !recipient.opened) {
    await prisma.$transaction([
      prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { opened: true, openedAt: new Date() },
      }),
      prisma.emailCampaign.update({
        where: { id: cid },
        data: { openCount: { increment: 1 } },
      }),
    ]);
  }

  if (type === "email.clicked" && recipient && !recipient.clicked) {
    await prisma.$transaction([
      prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: { clicked: true, clickedAt: new Date() },
      }),
      prisma.emailCampaign.update({
        where: { id: cid },
        data: { clickCount: { increment: 1 } },
      }),
    ]);
  }

  if (type === "email.complained" || type === "email.bounced") {
    // no-op aggregate for now
  }

  return NextResponse.json({ ok: true });
}
