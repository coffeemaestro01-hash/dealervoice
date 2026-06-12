import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { createSponsorshipCheckout, SPONSORSHIP_TIERS, type SponsorshipTier } from "@/lib/sponsorship/checkout";
import { z } from "zod";

const schema = z.object({
  dealershipId: z.string().cuid(),
  tier: z.enum(["city_30", "homepage_30"]),
  sponsorLabel: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const staff = await prisma.dealerStaff.findFirst({
    where: { dealershipId: parsed.data.dealershipId, userId: session.user.id, isActive: true },
    include: { dealership: { include: { subscription: true } } },
  });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dealervoice.io";
  const tier = parsed.data.tier as SponsorshipTier;

  try {
    const sessionCheckout = await createSponsorshipCheckout({
      dealershipId: parsed.data.dealershipId,
      tier,
      customerEmail: session.user.email,
      stripeCustomerId: staff.dealership.subscription?.stripeCustomerId,
      successUrl: `${appUrl}/dashboard/dealer/settings?sponsor=success`,
      cancelUrl: `${appUrl}/advertise?sponsor=canceled`,
      sponsorLabel: parsed.data.sponsorLabel ?? staff.dealership.name,
    });

    return NextResponse.json({
      url: sessionCheckout.url,
      tier: SPONSORSHIP_TIERS[tier],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
