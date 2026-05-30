import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { dealershipSchema } from "@/lib/validations";
import { deleteCachePattern } from "@/lib/redis";
import { indexDealership } from "@/lib/search";

async function isDealerAdmin(userId: string, dealershipId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId, isActive: true, role: { in: ["owner", "manager"] } },
  });
  return !!staff;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealer = await prisma.dealership.findUnique({
    where: { id, deletedAt: null },
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: true } },
      awards: true,
      subscription: { select: { plan: true, status: true } },
    },
  });

  if (!dealer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: dealer });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await isDealerAdmin(session.user.id, id);
  const isSuperAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);

  if (!isAdmin && !isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = dealershipSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { brandIds, ...updateData } = parsed.data as any;

  const dealer = await prisma.dealership.update({
    where: { id },
    data: updateData,
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: true } },
    },
  });

  await deleteCachePattern(`dealership:${dealer.slug}*`);

  await indexDealership({
    id: dealer.id,
    slug: dealer.slug,
    name: dealer.name,
    description: dealer.description ?? "",
    category: dealer.category,
    brandNames: dealer.brands.map((b: any) => b.brand.name),
    cityName: dealer.cityName ?? "",
    stateName: dealer.stateName ?? "",
    countryCode: dealer.country.code,
    countryName: dealer.country.name,
    overallRating: dealer.overallRating,
    totalReviews: dealer.totalReviews,
    reputationScore: dealer.reputationScore,
    isVerified: dealer.isVerified,
    isFeatured: dealer.isFeatured,
    latitude: dealer.latitude,
    longitude: dealer.longitude,
  }).catch(() => {});

  return NextResponse.json({ data: dealer });
}
