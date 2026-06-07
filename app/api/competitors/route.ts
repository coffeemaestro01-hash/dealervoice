import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

async function getStaffDealership(userId: string, dealershipId: string) {
  return prisma.dealerStaff.findFirst({
    where: { userId, dealershipId, isActive: true },
    include: { dealership: { include: { subscription: true } } },
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = req.nextUrl.searchParams.get("dealershipId");
  if (!dealershipId) return NextResponse.json({ error: "dealershipId required" }, { status: 400 });

  const staff = await getStaffDealership(session.user.id, dealershipId);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sub = staff.dealership.subscription;
  if (!sub?.competitorMonitoring && sub?.plan === "FREE") {
    return NextResponse.json({ error: "Competitor monitoring requires Pro or Enterprise." }, { status: 403 });
  }

  const competitors = await prisma.competitorSet.findMany({
    where: { primaryId: dealershipId },
    include: {
      competitor: {
        select: {
          id: true, name: true, slug: true, cityName: true, stateName: true,
          overallRating: true, totalReviews: true, reputationScore: true,
          country: { select: { code: true, name: true } },
          city: { select: { slug: true } },
        },
      },
    },
    orderBy: { addedAt: "desc" },
  });

  return NextResponse.json({ data: competitors });
}

const addSchema = z.object({
  dealershipId: z.string().cuid(),
  competitorId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const { dealershipId, competitorId } = parsed.data;
  if (dealershipId === competitorId) {
    return NextResponse.json({ error: "Cannot add yourself as a competitor" }, { status: 400 });
  }

  const staff = await getStaffDealership(session.user.id, dealershipId);
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sub = staff.dealership.subscription;
  if (!sub?.competitorMonitoring && sub?.plan === "FREE") {
    return NextResponse.json({ error: "Competitor monitoring requires Pro or Enterprise." }, { status: 403 });
  }

  const count = await prisma.competitorSet.count({ where: { primaryId: dealershipId } });
  const max = sub?.plan === "ENTERPRISE" ? 20 : 10;
  if (count >= max) {
    return NextResponse.json({ error: `Maximum ${max} competitors on your plan.` }, { status: 400 });
  }

  const competitor = await prisma.dealership.findUnique({
    where: { id: competitorId, deletedAt: null },
    select: { id: true },
  });
  if (!competitor) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });

  const entry = await prisma.competitorSet.upsert({
    where: { primaryId_competitorId: { primaryId: dealershipId, competitorId } },
    create: { primaryId: dealershipId, competitorId },
    update: {},
    include: {
      competitor: {
        select: {
          id: true, name: true, slug: true, cityName: true, overallRating: true, totalReviews: true, reputationScore: true,
          country: { select: { code: true } },
          city: { select: { slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}
