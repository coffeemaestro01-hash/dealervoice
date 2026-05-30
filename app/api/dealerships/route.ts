import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { dealershipSchema } from "@/lib/validations";
import { generateUniqueSlug } from "@/lib/utils";
import { indexDealership } from "@/lib/search";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = dealershipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;
  const id = crypto.randomUUID().slice(0, 8);
  const slug = generateUniqueSlug(data.name, id);

  const dealership = await prisma.dealership.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      category: data.category as any,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address,
      cityName: data.cityName,
      stateName: data.stateName,
      countryId: data.countryId,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      yearEstablished: data.yearEstablished,
      status: "ACTIVE",
      brands: data.brandIds?.length
        ? { create: data.brandIds.map((brandId, i) => ({ brandId, isPrimary: i === 0 })) }
        : undefined,
      staff: {
        create: { userId: session.user.id, role: "owner", acceptedAt: new Date() },
      },
      subscription: {
        create: { plan: "FREE", status: "ACTIVE" },
      },
    },
    include: {
      country: { select: { name: true, code: true } },
      city: { select: { name: true, slug: true } },
      brands: { include: { brand: true } },
    },
  });

  // Index in search
  await indexDealership({
    id: dealership.id,
    slug: dealership.slug,
    name: dealership.name,
    description: dealership.description ?? "",
    category: dealership.category,
    brandNames: dealership.brands.map((b) => b.brand.name),
    cityName: dealership.cityName ?? "",
    stateName: dealership.stateName ?? "",
    countryCode: dealership.country.code,
    countryName: dealership.country.name,
    overallRating: 0,
    totalReviews: 0,
    reputationScore: 0,
    isVerified: false,
    isFeatured: false,
    latitude: dealership.latitude,
    longitude: dealership.longitude,
  }).catch(() => {});

  // Upgrade user role if needed
  if (!["DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string)) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "DEALER_OWNER" },
    });
  }

  return NextResponse.json({ data: dealership }, { status: 201 });
}
