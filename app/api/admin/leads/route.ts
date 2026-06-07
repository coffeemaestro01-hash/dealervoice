import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isStaffRole } from "@/lib/admin/permissions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = new URL(req.url).searchParams.get("status") ?? "";
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? 1));
  const limit = 30;

  const where = status ? { status: status as "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED" } : {};

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { dealership: { select: { name: true, slug: true, cityName: true } } },
    }),
  ]);

  return NextResponse.json({ data: leads, total, page });
}
