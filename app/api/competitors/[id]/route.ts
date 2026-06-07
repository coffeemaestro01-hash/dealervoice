import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const entry = await prisma.competitorSet.findUnique({
    where: { id },
    include: { primary: { include: { staff: { where: { userId: session.user.id, isActive: true } } } } },
  });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (entry.primary.staff.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.competitorSet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
