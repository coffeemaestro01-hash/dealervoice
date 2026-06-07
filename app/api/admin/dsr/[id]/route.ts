import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isAdminRole } from "@/lib/admin/guards";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["submitted", "verifying", "in_progress", "ready", "completed", "rejected", "cancelled"]),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const data: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  if (parsed.data.status === "completed") data.completedAt = new Date();

  const request = await prisma.dsrRequest.update({
    where: { id },
    data,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ data: request });
}
