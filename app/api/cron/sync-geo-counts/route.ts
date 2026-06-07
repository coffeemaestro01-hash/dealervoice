import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/** Nightly job: refresh city + country dealer counts from live data. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cities = await prisma.city.findMany({ select: { id: true } });
  let citiesUpdated = 0;

  for (const city of cities) {
    const count = await prisma.dealership.count({
      where: { cityId: city.id, deletedAt: null },
    });
    await prisma.city.update({ where: { id: city.id }, data: { dealerCount: count } });
    citiesUpdated++;
  }

  const countries = await prisma.country.findMany({ select: { id: true } });
  let countriesUpdated = 0;

  for (const country of countries) {
    const count = await prisma.dealership.count({
      where: { countryId: country.id, deletedAt: null },
    });
    await prisma.country.update({ where: { id: country.id }, data: { dealerCount: count } });
    countriesUpdated++;
  }

  return NextResponse.json({ citiesUpdated, countriesUpdated });
}
