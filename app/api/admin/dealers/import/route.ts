import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = await req.text();
  const rows = parseCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No data rows found" }, { status: 422 });
  }

  const country = await prisma.country.findUnique({ where: { code: "US" } });
  if (!country) return NextResponse.json({ error: "United States country record missing" }, { status: 500 });

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name?.trim();
    const state = row.state?.trim();
    const city = row.city?.trim();
    if (!name || !state || !city) {
      skipped++;
      continue;
    }

    const slug = `${slugify(name)}-${slugify(city)}-${Date.now().toString(36).slice(-5)}`;
    const email = row.email?.trim() || null;

    try {
      await prisma.dealership.create({
        data: {
          slug,
          name: name.slice(0, 120),
          countryId: country.id,
          stateName: state,
          cityName: city,
          districtName: row.district?.trim() || null,
          phone: row.phone?.trim() || null,
          website: row.website?.trim() || null,
          email,
          emailSource: email ? "csv" : null,
          address: row.address?.trim() || null,
          status: "ACTIVE",
          category: "NEW_VEHICLE",
        },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  if (imported > 0) {
    await prisma.country.update({
      where: { id: country.id },
      data: { dealerCount: { increment: imported } },
    }).catch(() => {});
  }

  return NextResponse.json({ data: { imported, skipped } });
}
