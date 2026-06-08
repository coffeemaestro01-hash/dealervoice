import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { resolveAdHref } from "@/lib/ads/affiliate";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

const placementSchema = z.object({
  slot: z.string().min(1),
  adType: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  badge: z.string().min(1),
  accent: z.string().optional(),
  countryCode: z.string().length(2).optional().nullable(),
  cpcEstimatePaise: z.number().int().min(0).optional().nullable(),
  affiliateRef: z.string().max(200).optional().nullable(),
  affiliateParam: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const placements = await prisma.adPlacement.findMany({
    orderBy: [{ slot: "asc" }, { priority: "desc" }],
  });

  return NextResponse.json({
    data: placements.map((p) => ({
      ...p,
      resolvedHref: resolveAdHref(p.ctaHref, p.affiliateRef, p.affiliateParam),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "REVENUE"].includes(session.user.role as string)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = placementSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const created = await prisma.adPlacement.create({
    data: {
      ...parsed.data,
      accent: parsed.data.accent ?? "from-gold-600 to-amber-500",
      isActive: parsed.data.isActive ?? true,
      priority: parsed.data.priority ?? 0,
    },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "ad_placement.create",
    resource: "AdPlacement",
    resourceId: created.id,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
