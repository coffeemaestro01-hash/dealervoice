import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  make: z.string().min(1).max(80).optional(),
  model: z.string().min(1).max(80).optional(),
  trim: z.string().max(80).optional().nullable(),
  year: z.number().int().min(1980).max(2030).optional().nullable(),
  mileageKm: z.number().int().min(0).optional().nullable(),
  fuelType: z.string().max(40).optional().nullable(),
  transmission: z.string().max(40).optional().nullable(),
  condition: z.enum(["NEW", "USED", "CERTIFIED"]).optional(),
  priceMinor: z.number().int().min(0).optional().nullable(),
  priceLabel: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  affiliateUrl: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

async function canManage(userId: string, role: string, dealershipId: string) {
  if (["SUPER_ADMIN", "REVENUE", "MODERATOR"].includes(role)) return true;
  return prisma.dealerStaff.findFirst({
    where: { dealershipId, userId, isActive: true, role: { in: ["owner", "manager"] } },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; listingId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, listingId } = await ctx.params;
  if (!(await canManage(session.user.id, session.user.role as string, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const existing = await prisma.vehicleListing.findFirst({
    where: { id: listingId, dealershipId: id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.vehicleListing.update({
    where: { id: listingId },
    data: parsed.data,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; listingId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, listingId } = await ctx.params;
  if (!(await canManage(session.user.id, session.user.role as string, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.vehicleListing.findFirst({
    where: { id: listingId, dealershipId: id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.vehicleListing.update({
    where: { id: listingId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
