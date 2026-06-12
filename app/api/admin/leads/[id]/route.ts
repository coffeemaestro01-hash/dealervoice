import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isStaffRole } from "@/lib/admin/permissions";
import { logAdminAction } from "@/lib/admin/audit";
import { markLeadConverted } from "@/lib/leads/fees";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "CLOSED"]),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  if (parsed.data.status === "CONVERTED") {
    const result = await markLeadConverted(id, session.user.id);
    await logAdminAction({
      userId: session.user.id,
      action: "lead.status_update",
      resource: "Lead",
      resourceId: id,
      newValues: { status: parsed.data.status, billing: result.billing },
    });
    return NextResponse.json({ data: result.lead, billing: result.billing });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { dealership: { select: { name: true } } },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "lead.status_update",
    resource: "Lead",
    resourceId: id,
    newValues: { status: parsed.data.status },
  });

  return NextResponse.json({ data: lead });
}
