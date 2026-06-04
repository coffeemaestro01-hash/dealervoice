import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["MODERATOR", "SUPER_ADMIN"].includes(session.user.role as string);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const claims = await prisma.dealerClaim.findMany({
    orderBy: [
      { status: "asc" }, // PENDING will usually sort before REJECTED/APPROVED but let's just order by date
      { createdAt: "desc" },
    ],
    include: {
      dealership: { select: { id: true, name: true, slug: true, status: true } },
      submittedBy: { select: { id: true, name: true, email: true } },
      documents: true,
    },
  });

  // Sort PENDING first, then by date desc
  claims.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json({ data: claims });
}
