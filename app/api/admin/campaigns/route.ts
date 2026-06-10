import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";
import { sendEmailCampaign } from "@/lib/campaigns/send-campaign";

const createSchema = z.object({
  name: z.string().min(3).max(200),
  subject: z.string().min(5).max(200),
  body: z.string().min(20),
  filter: z.enum(["unclaimed", "claimed", "all"]),
  countryId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  send: z.boolean().default(true),
});

const AUDIENCE_MAP = {
  unclaimed: "UNCLAIMED",
  claimed: "CLAIMED",
  all: "ALL",
} as const;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  const where = {
    channel: "email",
    ...(status && status !== "all" ? { status: status.toUpperCase() as "SENT" | "DRAFT" | "FAILED" | "SENDING" } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { subject: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [campaigns, total] = await Promise.all([
    prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        country: { select: { name: true, code: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.emailCampaign.count({ where }),
  ]);

  return NextResponse.json({ campaigns, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const audience = AUDIENCE_MAP[parsed.data.filter];

  const campaign = await prisma.emailCampaign.create({
    data: {
      name: parsed.data.name,
      subject: parsed.data.subject,
      bodyHtml: parsed.data.body,
      audience,
      countryId: parsed.data.countryId,
      createdById: session.user.id,
      status: parsed.data.send ? "SENDING" : "DRAFT",
    },
  });

  if (!parsed.data.send) {
    return NextResponse.json({ campaign });
  }

  const result = await sendEmailCampaign({
    campaignId: campaign.id,
    subject: parsed.data.subject,
    bodyHtml: parsed.data.body,
    audience,
    countryId: parsed.data.countryId,
    limit: parsed.data.limit,
  });

  await logAdminAction({
    userId: session.user.id,
    action: "campaign.send",
    resource: "EmailCampaign",
    resourceId: campaign.id,
    newValues: { name: parsed.data.name, subject: parsed.data.subject, ...result, filter: parsed.data.filter },
  });

  const updated = await prisma.emailCampaign.findUnique({ where: { id: campaign.id } });
  return NextResponse.json({ campaign: updated, ...result });
}
