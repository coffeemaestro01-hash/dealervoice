import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  addServiceArea,
  getDealerPlan,
  getServiceAreaLimit,
  listServiceAreas,
  removeServiceArea,
} from "@/lib/dealer/service-areas";

async function getStaffDealership(userId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    select: { dealershipId: true },
  });
  return staff?.dealershipId ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = await getStaffDealership(session.user.id);
  if (!dealershipId) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const [areas, plan, limit] = await Promise.all([
    listServiceAreas(dealershipId),
    getDealerPlan(dealershipId),
    getServiceAreaLimit(dealershipId),
  ]);

  return NextResponse.json({ areas, plan, limit, used: areas.length });
}

const addSchema = z.object({
  cityName: z.string().min(1).max(120),
  stateName: z.string().max(120).optional(),
  stateCode: z.string().max(8).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = await getStaffDealership(session.user.id);
  if (!dealershipId) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const area = await addServiceArea(dealershipId, parsed.data);
    return NextResponse.json({ area });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add service area";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = await getStaffDealership(session.user.id);
  if (!dealershipId) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const areaId = req.nextUrl.searchParams.get("id");
  if (!areaId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await removeServiceArea(dealershipId, areaId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove service area";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
