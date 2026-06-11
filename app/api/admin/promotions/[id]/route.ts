import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";
import { getStripe } from "@/lib/payment";

const patchSchema = z.object({
  active: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const promo = await prisma.promotionCode.findUnique({ where: { id } });
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await getStripe().promotionCodes.update(promo.stripePromotionCodeId, {
      active: parsed.data.active,
    });
  } catch (err) {
    console.error("Stripe promotion update failed:", err);
  }

  const updated = await prisma.promotionCode.update({
    where: { id },
    data: { active: parsed.data.active },
  });

  await logAdminAction({
    userId: session.user.id,
    action: "promotion.update",
    resource: "PromotionCode",
    resourceId: id,
    newValues: { active: parsed.data.active },
  });

  return NextResponse.json({ promotion: updated });
}
