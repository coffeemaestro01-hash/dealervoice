import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { resolveAdHref } from "@/lib/ads/affiliate";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const patchSchema = z.object({
  slot: z.string().min(1).optional(),
  adType: z.string().min(1).optional(),
  headline: z.string().min(1).optional(),
  subheadline: z.string().min(1).optional(),
  ctaLabel: z.string().min(1).optional(),
  ctaHref: z.string().min(1).optional(),
  badge: z.string().min(1).optional(),
  accent: z.string().optional(),
  countryCode: z.string().length(2).optional().nullable(),
  cpcEstimatePaise: z.number().int().min(0).optional().nullable(),
  affiliateRef: z.string().max(200).optional().nullable(),
  affiliateParam: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const updated = await prisma.adPlacement.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await logAdminAction({
    userId: session.user.id,
    action: "ad_placement.update",
    resource: "AdPlacement",
    resourceId: params.id,
    newValues: parsed.data,
  });

  return NextResponse.json({
    data: {
      ...updated,
      resolvedHref: resolveAdHref(updated.ctaHref, updated.affiliateRef, updated.affiliateParam),
    },
  });
}
