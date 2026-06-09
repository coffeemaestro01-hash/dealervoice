import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({ dealershipId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dealershipId is required" }, { status: 422 });
  }

  const { dealershipId } = parsed.data;

  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId, deletedAt: null },
    select: { id: true },
  });
  if (!dealer) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  await prisma.savedDealer.upsert({
    where: { userId_dealershipId: { userId: session.user.id, dealershipId } },
    create: { userId: session.user.id, dealershipId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const dealershipId = new URL(req.url).searchParams.get("dealershipId");
  if (!dealershipId) return NextResponse.json({ error: "dealershipId required" }, { status: 400 });

  await prisma.savedDealer.deleteMany({
    where: { userId: session.user.id, dealershipId },
  });

  return NextResponse.json({ saved: false });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const dealershipId = new URL(req.url).searchParams.get("dealershipId");

  if (dealershipId) {
    const entry = await prisma.savedDealer.findUnique({
      where: { userId_dealershipId: { userId: session.user.id, dealershipId } },
      select: { id: true },
    });
    return NextResponse.json({ saved: !!entry });
  }

  return NextResponse.json({ error: "dealershipId required" }, { status: 400 });
}
