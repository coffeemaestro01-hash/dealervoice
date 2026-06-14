import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  category: z.enum(["BILLING", "TECHNICAL", "CLAIM", "REVIEWS", "OTHER"]).default("OTHER"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { dealershipId: true },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tickets = await prisma.supportTicket.findMany({
    where: { dealershipId: staff.dealershipId },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ data: tickets });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { dealershipId: true },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 422 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      dealershipId: staff.dealershipId,
      userId: session.user.id,
      subject: parsed.data.subject,
      message: parsed.data.message,
      category: parsed.data.category,
    },
  });

  return NextResponse.json({ data: ticket }, { status: 201 });
}
