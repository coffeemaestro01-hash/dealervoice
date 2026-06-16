import prisma from "@/lib/db";
import { sendAdminNotification } from "@/lib/email";
import { sendSlackAlert } from "@/lib/admin/slack";
import { formatPromoPrice } from "@/lib/promotions";
import type { SubscriptionPlan } from "@prisma/client";

export async function maybeSendAdminSubscriptionAlert(
  dealershipId: string,
  plan: SubscriptionPlan,
  interval: "monthly" | "annual",
  promotionCode?: string
) {
  const sub = await prisma.dealerSubscription.findUnique({
    where: { dealershipId },
    select: { id: true, adminAlertSentAt: true },
  });
  if (!sub || sub.adminAlertSentAt) return;

  const dealer = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    select: {
      name: true,
      slug: true,
      cityName: true,
      stateName: true,
      country: { select: { code: true } },
    },
  });
  if (!dealer) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const location = [dealer.cityName, dealer.stateName, dealer.country?.code]
    .filter(Boolean)
    .join(", ");
  const planLabel =
    plan === "ENTERPRISE" ? "Enterprise" : plan === "PRO_PLUS" ? "Pro+" : "Pro";
  const promoLine = promotionCode ? `<p>Promo code: <strong>${promotionCode}</strong></p>` : "";

  await sendAdminNotification(
    `💳 New ${planLabel} subscription — ${dealer.name}`,
    `<p><strong>${dealer.name}</strong>${location ? ` · ${location}` : ""} just subscribed to <strong>${planLabel}</strong> (${interval}).</p>
${promoLine}
<p><a href="${appUrl}/dealership/${dealer.slug}" style="color:#C9961E">View profile</a> ·
<a href="${appUrl}/dashboard/admin/subscriptions" style="color:#C9961E">Admin subscriptions</a></p>`
  ).catch(() => {});

  await sendSlackAlert(
    `💳 New ${planLabel} subscription: *${dealer.name}* (${interval}${promotionCode ? `, code ${promotionCode}` : ""}) — ${appUrl}/dealership/${dealer.slug}`
  ).catch(() => {});

  await prisma.dealerSubscription.update({
    where: { id: sub.id },
    data: { adminAlertSentAt: new Date() },
  });
}

export function formatSubscriptionAmount(plan: SubscriptionPlan, interval: string, amountCents: number) {
  if (amountCents > 0) return formatPromoPrice(amountCents);
  if (plan === "PRO_PLUS") return interval === "annual" ? "$3,490/yr" : "$349/mo";
  return plan === "PRO" ? (interval === "annual" ? "$1,990/yr" : "$199/mo") : "Enterprise";
}
