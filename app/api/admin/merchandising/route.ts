import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const schema = z.object({
  dealershipId: z.string().cuid(),
  homepagePinOrder: z.number().int().min(1).max(20).nullable(),
  isFeatured: z.boolean().optional(),
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
      homepagePinOrder: parsed.data.homepagePinOrder,
      ...(parsed.data.isFeatured !== undefined ? { isFeatured: parsed.data.isFeatured } : {}),
    },
    select: { id: true, name: true, homepagePinOrder: true, isFeatured: true },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "merchandising.update",
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

  const pinned = await prisma.dealership.findMany({
    where: { homepagePinOrder: { not: null }, deletedAt: null },
    orderBy: { homepagePinOrder: "asc" },
    select: { id: true, name: true, slug: true, homepagePinOrder: true, isFeatured: true, totalReviews: true },
  });

  return NextResponse.json({ data: pinned });
}
