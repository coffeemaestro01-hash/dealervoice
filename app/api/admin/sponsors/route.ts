import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const schema = z.object({
  dealershipId: z.string().cuid(),
  isSponsored: z.boolean(),
  sponsorLabel: z.string().max(100).optional(),
  sponsoredUntil: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const dealer = await prisma.dealership.update({
    where: { id: parsed.data.dealershipId },
    data: {
      isSponsored: parsed.data.isSponsored,
      sponsorLabel: parsed.data.sponsorLabel ?? null,
      sponsoredUntil: parsed.data.sponsoredUntil ? new Date(parsed.data.sponsoredUntil) : null,
    },
    select: { id: true, name: true, isSponsored: true, sponsorLabel: true, sponsoredUntil: true },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "sponsor.update",
    resource: "Dealership",
    resourceId: dealer.id,
    newValues: parsed.data,
  });

  return NextResponse.json({ data: dealer });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sponsors = await prisma.dealership.findMany({
    where: { isSponsored: true, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      cityName: true,
      sponsorLabel: true,
      sponsoredUntil: true,
      isSponsored: true,
    },
  });

  return NextResponse.json({ data: sponsors });
}
