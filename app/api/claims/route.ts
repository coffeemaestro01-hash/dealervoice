import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { claimSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { dealershipId, businessEmail, businessPhone, notes } = parsed.data;

  const dealership = await prisma.dealership.findUnique({ where: { id: dealershipId, deletedAt: null } });
  if (!dealership) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  // Check for existing pending/approved claim
  const existingClaim = await prisma.dealerClaim.findFirst({
    where: { dealershipId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existingClaim) {
    return NextResponse.json({ error: "A claim for this dealership is already pending or approved." }, { status: 409 });
  }

  const claim = await prisma.dealerClaim.create({
    data: {
      dealershipId,
      submittedById: session.user.id,
      businessEmail,
      businessPhone,
      notes,
      status: "PENDING",
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ data: claim, message: "Claim submitted. We will review it within 2-3 business days." }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await prisma.dealerClaim.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { dealership: { select: { id: true, name: true, slug: true } } },
  });

  return NextResponse.json({ data: claims });
}
