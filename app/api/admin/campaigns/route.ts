import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { Resend } from "resend";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "DealerVoice <noreply@dealervoice.io>";

const schema = z.object({
  subject: z.string().min(5).max(200),
  body: z.string().min(20),
  filter: z.enum(["unclaimed", "claimed", "all"]),
  countryId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const where: Record<string, unknown> = {
    deletedAt: null,
    email: { not: null },
    ...(parsed.data.countryId ? { countryId: parsed.data.countryId } : {}),
    ...(parsed.data.filter === "unclaimed" ? { claimedAt: null } : {}),
    ...(parsed.data.filter === "claimed" ? { claimedAt: { not: null } } : {}),
  };

  const dealers = await prisma.dealership.findMany({
    where,
    take: parsed.data.limit,
    select: { id: true, name: true, email: true, slug: true },
  });

  const emails = dealers.map((d) => d.email).filter(Boolean) as string[];
  if (emails.length === 0) return NextResponse.json({ error: "No recipients found" }, { status: 404 });

  let sent = 0;
  for (const email of emails) {
    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: parsed.data.subject,
        html: `<div style="font-family:sans-serif;line-height:1.6">${parsed.data.body}</div>`,
      });
      sent++;
    } catch {
      /* continue */
    }
  }

  await logAdminAction({
    userId: session.user.id,
    action: "campaign.send",
    resource: "Campaign",
    newValues: { subject: parsed.data.subject, sent, filter: parsed.data.filter },
  });

  return NextResponse.json({ sent, total: emails.length });
}
