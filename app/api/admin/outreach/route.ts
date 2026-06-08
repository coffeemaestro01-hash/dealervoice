import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { INDIA_LAUNCH_STATES } from "@/lib/geo/india";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const state = searchParams.get("state");
  const status = searchParams.get("status") ?? "pending";
  const hasWebsite = searchParams.get("hasWebsite") === "1";

  const india = await prisma.country.findUnique({ where: { code: "IN" }, select: { id: true } });
  if (!india) return NextResponse.json({ data: { total: 0, dealers: [], page, pages: 0 } });

  const where = {
    countryId: india.id,
    deletedAt: null,
    claimedAt: null,
    phone: { not: "" },
    NOT: { phone: null },
    AND: [
      { OR: [{ email: null }, { email: "" }] },
      ...(hasWebsite ? [{ website: { not: null } }, { NOT: { website: "" } }] : []),
      ...(state
        ? [{ stateName: { contains: state.replace(/-/g, " "), mode: "insensitive" as const } }]
        : []),
      ...(status === "pending"
        ? [{ OR: [{ outreachStatus: null }, { outreachStatus: "pending" }] }]
        : status !== "all"
          ? [{ outreachStatus: status }]
          : []),
    ],
  };

  const [total, dealers, stateCounts] = await Promise.all([
    prisma.dealership.count({ where }),
    prisma.dealership.findMany({
      where,
      orderBy: [{ stateName: "asc" }, { cityName: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        website: true,
        cityName: true,
        stateName: true,
        districtName: true,
        outreachStatus: true,
        lastOutreachAt: true,
        outreachNotes: true,
        totalReviews: true,
      },
    }),
    prisma.dealership.groupBy({
      by: ["stateName"],
      where: {
        countryId: india.id,
        deletedAt: null,
        claimedAt: null,
        phone: { not: null },
        NOT: { phone: "" },
        OR: [{ email: null }, { email: "" }],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 40,
    }),
  ]);

  return NextResponse.json({
    data: {
      total,
      page,
      pages: Math.ceil(total / limit),
      dealers,
      launchStates: INDIA_LAUNCH_STATES,
      stateCounts: stateCounts
        .filter((s) => s.stateName)
        .map((s) => ({ state: s.stateName!, count: s._count.id })),
    },
  });
}
