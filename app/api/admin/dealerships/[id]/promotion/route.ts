import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { logAdminAction } from "@/lib/admin/audit";
import { createDealerPromotion } from "@/lib/promotions";

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dealershipId = params.id;
  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    select: { id: true, name: true },
  });
  if (!dealer) return NextResponse.json({ error: "Dealer not found" }, { status: 404 });

  try {
    const promotion = await createDealerPromotion(dealershipId, session.user.id);
    await logAdminAction({
      userId: session.user.id,
      action: "promotion.dealer.create",
      resource: "PromotionCode",
      resourceId: promotion.id,
      newValues: { code: promotion.code, dealershipId },
    });
    return NextResponse.json({ promotion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create dealer promotion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
