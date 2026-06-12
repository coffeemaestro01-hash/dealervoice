import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { authenticateApiKey } from "@/lib/api/dealer-keys";

const listingSchema = z.object({
  stockId: z.string().max(120).optional(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  trim: z.string().max(80).optional(),
  year: z.number().int().min(1980).max(2030).optional(),
  priceMinor: z.number().int().min(0).optional(),
  mileageKm: z.number().int().min(0).optional(),
  vin: z.string().max(32).optional(),
  photoUrl: z.string().url().optional(),
  listingUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

const bodySchema = z.object({
  listings: z.array(listingSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  const dealer = await authenticateApiKey(req.headers.get("authorization"));
  if (!dealer) {
    return NextResponse.json({ error: "Invalid or unauthorized API key" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const dealership = await prisma.dealership.findUnique({
    where: { id: dealer.id },
    select: { country: { select: { code: true } } },
  });
  const countryCode = dealership?.country?.code ?? "US";

  let created = 0;
  let updated = 0;

  for (const item of parsed.data.listings) {
    const existing = item.stockId
      ? await prisma.vehicleListing.findFirst({
          where: { dealershipId: dealer.id, stockId: item.stockId },
        })
      : null;

    const data = {
      make: item.make,
      model: item.model,
      trim: item.trim,
      year: item.year,
      priceMinor: item.priceMinor,
      mileageKm: item.mileageKm,
      vin: item.vin,
      photos: item.photoUrl ? [item.photoUrl] : [],
      affiliateUrl: item.listingUrl,
      description: item.description,
      isActive: item.isActive,
      stockId: item.stockId,
      countryCode,
      currency: "USD",
      source: "CSV_IMPORT" as const,
    };

    if (existing) {
      await prisma.vehicleListing.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.vehicleListing.create({
        data: { ...data, dealershipId: dealer.id },
      });
      created++;
    }
  }

  return NextResponse.json({ ok: true, created, updated, dealershipId: dealer.id });
}

export async function GET(req: NextRequest) {
  const dealer = await authenticateApiKey(req.headers.get("authorization"));
  if (!dealer) {
    return NextResponse.json({ error: "Invalid or unauthorized API key" }, { status: 401 });
  }

  const listings = await prisma.vehicleListing.findMany({
    where: { dealershipId: dealer.id, isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: listings });
}
