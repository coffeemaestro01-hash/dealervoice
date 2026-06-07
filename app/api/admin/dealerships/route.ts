import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isAdminRole } from "@/lib/admin/guards";
import { generateUniqueSlug } from "@/lib/utils";
import { logAdminAction } from "@/lib/admin/audit";
import { indexDealership } from "@/lib/search";

const createSchema = z.object({
  name: z.string().min(2).max(200),
  countryId: z.string().cuid(),
  cityName: z.string().max(100).optional(),
  stateName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  category: z
    .enum(["NEW_VEHICLE", "USED_VEHICLE", "LUXURY", "COMMERCIAL", "MOTORCYCLE", "EV", "MULTI_BRAND"])
    .default("NEW_VEHICLE"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const country = await prisma.country.findUnique({ where: { id: parsed.data.countryId } });
  if (!country) return NextResponse.json({ error: "Country not found" }, { status: 404 });

  const id = crypto.randomUUID().slice(0, 8);
  const slug = generateUniqueSlug(parsed.data.name, id);

  const dealership = await prisma.dealership.create({
    data: {
      slug,
      name: parsed.data.name,
      category: parsed.data.category,
      countryId: parsed.data.countryId,
      cityName: parsed.data.cityName,
      stateName: parsed.data.stateName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      website: parsed.data.website,
      status: "ACTIVE",
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
    },
    include: { country: { select: { name: true, code: true } } },
  });

  await indexDealership({
    id: dealership.id,
    slug: dealership.slug,
    name: dealership.name,
    description: "",
    category: dealership.category,
    brandNames: [],
    cityName: dealership.cityName ?? "",
    stateName: dealership.stateName ?? "",
    countryCode: dealership.country.code,
    countryName: dealership.country.name,
    overallRating: 0,
    totalReviews: 0,
    reputationScore: 0,
    isVerified: false,
    isFeatured: false,
    latitude: null,
    longitude: null,
  }).catch(() => {});

  await logAdminAction({
    userId: session.user.id,
    action: "dealership.admin_create",
    resource: "Dealership",
    resourceId: dealership.id,
    newValues: { name: dealership.name, slug: dealership.slug },
  });

  return NextResponse.json({ data: dealership }, { status: 201 });
}
