import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { INDIA_LAUNCH_STATES } from "@/lib/geo/india";
import { US_PRIORITY_STATES } from "@/lib/geo/us";

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
  const countryCode = (searchParams.get("country") ?? "US").toUpperCase();
  const mode = searchParams.get("mode") ?? "drip";

  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    select: { id: true, code: true },
  });
  if (!country) return NextResponse.json({ data: { total: 0, dealers: [], page, pages: 0 } });

  const statusFilter =
    status === "pending"
      ? { OR: [{ outreachStatus: null }, { outreachStatus: "pending" }] }
      : status !== "all"
        ? { outreachStatus: status }
        : {};

  const websiteFilter = hasWebsite
    ? { website: { not: null }, NOT: { OR: [{ website: "" }, { website: null }] } }
    : {};

  const where =
    mode === "drip"
      ? {
          countryId: country.id,
          deletedAt: null,
          claimedAt: null,
          email: { not: null },
          NOT: { email: "" },
          ...statusFilter,
          ...websiteFilter,
          ...(state
            ? { stateName: { contains: state.replace(/-/g, " "), mode: "insensitive" as const } }
            : {}),
        }
      : {
          countryId: country.id,
          deletedAt: null,
          claimedAt: null,
          phone: { not: "" },
          NOT: { phone: null },
          AND: [{ OR: [{ email: null }, { email: "" }] }],
          ...statusFilter,
          ...websiteFilter,
          ...(state
            ? { stateName: { contains: state.replace(/-/g, " "), mode: "insensitive" as const } }
            : {}),
        };

  const stateCountWhere =
    mode === "drip"
      ? {
          countryId: country.id,
          deletedAt: null,
          claimedAt: null,
          email: { not: null },
          NOT: { email: "" },
        }
      : {
          countryId: country.id,
          deletedAt: null,
          claimedAt: null,
          phone: { not: null },
          NOT: { phone: "" },
          OR: [{ email: null }, { email: "" }],
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
        email: true,
        phone: true,
        website: true,
        cityName: true,
        stateName: true,
        districtName: true,
        outreachStatus: true,
        lastOutreachAt: true,
        outreachNotes: true,
        totalReviews: true,
        outreachDripStep: true,
        outreachDripActive: true,
        nextOutreachAt: true,
      },
    }),
    prisma.dealership.groupBy({
      by: ["stateName"],
      where: stateCountWhere,
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
      country: country.code,
      mode,
      launchStates: country.code === "IN" ? INDIA_LAUNCH_STATES : US_PRIORITY_STATES,
      stateCounts: stateCounts
        .filter((s) => s.stateName)
        .map((s) => ({ state: s.stateName!, count: s._count.id })),
    },
  });
}
