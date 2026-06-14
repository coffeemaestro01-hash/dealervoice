import prisma from "@/lib/db";
import { getStripe, STRIPE_ENABLED } from "@/lib/payment";

export async function createBillingPortalSession(dealershipId: string, returnUrl: string) {
  if (!STRIPE_ENABLED) throw new Error("Payment gateway not configured");

  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId },
    select: { stripeCustomerId: true },
  });

  if (!sub?.stripeCustomerId) {
    throw new Error("No Stripe customer on file for this dealership");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
