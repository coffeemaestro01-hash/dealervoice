import prisma from "@/lib/db";
import { sendSubscriptionWelcomeEmail } from "@/lib/email";
import type { SubscriptionPlan } from "@prisma/client";
import type { BillingInterval } from "@/lib/payment";

export async function maybeSendSubscriptionWelcomeEmail(
  dealershipId: string,
  plan: SubscriptionPlan,
  interval: BillingInterval
) {
  if (plan === "FREE") return;

  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId },
    select: { id: true, welcomeEmailSentAt: true, status: true },
  });
  if (!sub || sub.welcomeEmailSentAt || sub.status !== "ACTIVE") return;

  const claimed = await prisma.dealerSubscription.updateMany({
    where: { id: sub.id, welcomeEmailSentAt: null },
    data: { welcomeEmailSentAt: new Date() },
  });
  if (claimed.count === 0) return;

  try {
    const dealership = await prisma.dealership.findUnique({
      where: { id: dealershipId },
      select: {
        name: true,
        slug: true,
        staff: {
          where: { isActive: true },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });
    if (!dealership) return;

    const ownerStaff =
      dealership.staff.find((s) => s.role === "owner") ?? dealership.staff[0];
    const email = ownerStaff?.user.email;
    if (!email) return;

    await sendSubscriptionWelcomeEmail(email, {
      name: ownerStaff.user.name ?? "there",
      dealerName: dealership.name,
      dealerSlug: dealership.slug,
      plan,
      interval,
    });
  } catch (err) {
    await prisma.dealerSubscription.update({
      where: { id: sub.id },
      data: { welcomeEmailSentAt: null },
    });
    console.error("Subscription welcome email failed:", err);
  }
}
