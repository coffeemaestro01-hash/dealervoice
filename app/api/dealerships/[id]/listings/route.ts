import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  trim: z.string().max(80).optional(),
  year: z.number().int().min(1980).max(2030).optional(),
  mileageKm: z.number().int().min(0).optional(),
  fuelType: z.string().max(40).optional(),
  transmission: z.string().max(40).optional(),
  condition: z.enum(["NEW", "USED", "CERTIFIED"]).optional(),
  priceMinor: z.number().int().min(0).optional(),
  priceLabel: z.string().max(40).optional(),
  color: z.string().max(40).optional(),
  currency: z.string().length(3).optional(),
  affiliateUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const listings = await prisma.vehicleListing.findMany({
    where: { dealershipId: id, isActive: true },
    orderBy: { listedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: listings });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const dealer = await prisma.dealership.findUnique({
    where: { id, deletedAt: null },
    include: { subscription: true, country: true },
  });
  if (!dealer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = ["SUPER_ADMIN", "REVENUE", "MODERATOR"].includes(session.user.role as string);
  const isDealerAdmin = await prisma.dealerStaff.findFirst({
    where: { dealershipId: id, userId: session.user.id, isActive: true, role: { in: ["owner", "manager"] } },
  });

  if (!isStaff && !isDealerAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const listing = await prisma.vehicleListing.create({
    data: {
      dealershipId: id,
      countryCode: dealer.country.code,
      currency: parsed.data.currency ?? dealer.country.currency ?? "USD",
      ...parsed.data,
    },
  });

  return NextResponse.json({ data: listing }, { status: 201 });
}
