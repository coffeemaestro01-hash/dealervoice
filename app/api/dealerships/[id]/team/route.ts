import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  photoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

async function isDealerAdmin(userId: string, dealershipId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId, isActive: true, role: { in: ["owner", "manager"] } },
  });
  return !!staff;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealershipId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await isDealerAdmin(session.user.id, dealershipId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 422 });
    }

    const member = await prisma.teamMember.create({
      data: {
        ...parsed.data,
        dealershipId,
      },
    });

    return NextResponse.json({ data: member });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
