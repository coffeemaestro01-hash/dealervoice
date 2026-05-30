import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      dealership: {
        select: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          overallRating: true,
          reputationScore: true,
          responseRate: true,
          totalReviews: true,
          subscription: { select: { plan: true, status: true } },
        },
      },
    },
    orderBy: { invitedAt: "asc" },
  });

  if (!staff) return NextResponse.json({ data: null });
  return NextResponse.json({ data: staff.dealership });
}
