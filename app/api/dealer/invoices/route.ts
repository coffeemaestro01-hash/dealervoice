import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    select: { dealershipId: true },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invoices = await prisma.invoice.findMany({
    where: { dealershipId: staff.dealershipId },
    orderBy: { invoiceDate: "desc" },
    take: 50,
    select: {
      id: true,
      invoiceNumber: true,
      type: true,
      description: true,
      amount: true,
      currency: true,
      status: true,
      pdfUrl: true,
      invoiceDate: true,
      paidAt: true,
    },
  });

  return NextResponse.json({ data: invoices });
}
