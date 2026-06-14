import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { createBillingPortalSession } from "@/lib/billing/portal";
import { APP_URL } from "@/lib/constants/emails";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dealershipId, returnUrl } = await req.json().catch(() => ({}));
  if (!dealershipId) {
    return NextResponse.json({ error: "dealershipId required" }, { status: 422 });
  }

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId, userId: session.user.id, isActive: true },
    include: { dealership: { include: { subscription: true } } },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!staff.dealership.subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account on file" }, { status: 422 });
  }

  try {
    const url = await createBillingPortalSession(
      dealershipId,
      returnUrl || `${APP_URL}/dashboard/dealer/billing`
    );
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
