import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { markLeadConverted } from "@/lib/leads/fees";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "CLOSED"]),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: { dealership: { select: { id: true } } },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lead = await prisma.lead.findFirst({
    where: { id, dealershipId: staff.dealershipId },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status === "CONVERTED") {
    const result = await markLeadConverted(id, session.user.id);
    return NextResponse.json({ data: result.lead, billing: result.billing });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ data: updated });
}
