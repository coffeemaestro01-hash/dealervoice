import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isStaffRole } from "@/lib/admin/permissions";
import { z } from "zod";

const createSchema = z.object({
  targetType: z.enum(["user", "dealership"]),
  targetId: z.string().cuid(),
  body: z.string().min(2).max(5000),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");
  if (!targetType || !targetId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const notes = await prisma.adminNote.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ data: notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const note = await prisma.adminNote.create({
    data: { ...parsed.data, authorId: session.user.id },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ data: note }, { status: 201 });
}
