import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import {
  getDealerPlan,
  linkEnterpriseLocation,
  listEnterpriseLinks,
  unlinkEnterpriseLocation,
} from "@/lib/dealer/service-areas";
import { ENTERPRISE_LINKED_LOCATIONS } from "@/lib/subscription/plan-limits";

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

  const plan = await getDealerPlan(dealershipId);
  const links = plan === "ENTERPRISE" ? await listEnterpriseLinks(dealershipId) : [];

  return NextResponse.json({ links, limit: ENTERPRISE_LINKED_LOCATIONS, plan });
}

const linkSchema = z.object({ linkedDealershipId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = await getStaffDealership(session.user.id);
  if (!dealershipId) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const link = await linkEnterpriseLocation(dealershipId, parsed.data.linkedDealershipId);
    return NextResponse.json({ link });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to link location";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dealershipId = await getStaffDealership(session.user.id);
  if (!dealershipId) return NextResponse.json({ error: "No dealership" }, { status: 404 });

  const linkId = req.nextUrl.searchParams.get("id");
  if (!linkId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await unlinkEnterpriseLocation(dealershipId, linkId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to unlink location";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
