import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";
import {
  createPromotionRecord,
  ensureDefaultProOneDollarPromo,
  normalizePromoCode,
  validateFixedPrice,
  validatePercentOff,
} from "@/lib/promotions";
import { planAmountCents } from "@/lib/payment";

const baseCreateSchema = z.object({
  code: z.string().min(3).max(32),
  label: z.string().max(120).optional(),
  plan: z.enum(["PRO", "PRO_PLUS", "ENTERPRISE"]),
  interval: z.enum(["monthly", "annual"]),
  maxRedemptions: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
});

const createSchema = z.discriminatedUnion("discountType", [
  baseCreateSchema.extend({
    discountType: z.literal("FIXED"),
    fixedPriceUsdCents: z.number().int().min(1),
  }),
  baseCreateSchema.extend({
    discountType: z.literal("PERCENT"),
    percentOff: z.number().int().min(1).max(100),
  }),
]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureDefaultProOneDollarPromo(session.user.id).catch((err) => {
    console.error("ensureDefaultProOneDollarPromo:", err);
  });

  const promotions = await prisma.promotionCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      dealership: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json({ promotions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const code = normalizePromoCode(parsed.data.code);
  const existing = await prisma.promotionCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Promotion code already exists" }, { status: 409 });
  }

  if (parsed.data.discountType === "FIXED") {
    try {
      validateFixedPrice(parsed.data.plan, parsed.data.interval, parsed.data.fixedPriceUsdCents);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid fixed price";
      return NextResponse.json({ error: message }, { status: 422 });
    }
  } else {
    try {
      validatePercentOff(parsed.data.percentOff);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid percent off";
      return NextResponse.json({ error: message }, { status: 422 });
    }
  }

  // Sanity check list price exists (used by fixed-price validation)
  planAmountCents(parsed.data.plan, parsed.data.interval);

  try {
    const promotion = await createPromotionRecord({
      code,
      label: parsed.data.label,
      plan: parsed.data.plan,
      interval: parsed.data.interval,
      maxRedemptions: parsed.data.maxRedemptions,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      createdById: session.user.id,
      ...(parsed.data.discountType === "FIXED"
        ? {
            discountType: "FIXED" as const,
            fixedPriceUsdCents: parsed.data.fixedPriceUsdCents,
          }
        : {
            discountType: "PERCENT" as const,
            percentOff: parsed.data.percentOff,
          }),
    });

    await logAdminAction({
      userId: session.user.id,
      action: "promotion.create",
      resource: "PromotionCode",
      resourceId: promotion.id,
      newValues: {
        code: promotion.code,
        plan: promotion.plan,
        interval: promotion.interval,
        discountType: promotion.discountType,
      },
    });

    return NextResponse.json({ promotion });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create promotion";
    console.error("Create promotion failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
