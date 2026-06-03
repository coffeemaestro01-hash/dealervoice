import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.array(z.object({
  id: z.string().cuid(),
  sortOrder: z.number().int(),
}));

async function isDealerAdmin(userId: string, dealershipId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId, isActive: true, role: { in: ["owner", "manager"] } },
  });
  return !!staff;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: dealershipId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await isDealerAdmin(session.user.id, dealershipId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 422 });
    }

    // Transaction to update all orders
    await prisma.$transaction(
      parsed.data.map((item) =>
        prisma.teamMember.updateMany({
          where: { id: item.id, dealershipId },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ message: "Reordered successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
