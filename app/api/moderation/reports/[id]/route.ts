import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { isAdminRole } from "@/lib/admin/guards";

const patchSchema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"]),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  const report = await prisma.report.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ data: report });
}
