import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { startOutreachDrip } from "@/lib/outreach/drip";
import { z } from "zod";

const patchSchema = z.object({
  outreachStatus: z.enum(["pending", "contacted", "skipped", "responded"]).optional(),
  outreachNotes: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  startDrip: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const data: Record<string, unknown> = {};
  if (parsed.data.outreachStatus) {
    data.outreachStatus = parsed.data.outreachStatus;
    data.lastOutreachAt = new Date();
  }
  if (parsed.data.outreachNotes !== undefined) data.outreachNotes = parsed.data.outreachNotes;
  if (parsed.data.email) {
    data.email = parsed.data.email;
    data.emailSource = "manual";
  }

  const dealer = await prisma.dealership.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, outreachStatus: true, lastOutreachAt: true, outreachDripStep: true },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "outreach.update",
    resource: "Dealership",
    resourceId: params.id,
    newValues: parsed.data,
  });

  if (parsed.data.startDrip && parsed.data.email && dealer.outreachDripStep === 0) {
    await startOutreachDrip(params.id, session.user.id).catch((err) => {
      console.error("startOutreachDrip after PATCH:", err);
    });
  }

  return NextResponse.json({ data: dealer });
}
