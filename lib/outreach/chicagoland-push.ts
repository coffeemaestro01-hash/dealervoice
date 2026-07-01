import prisma from "@/lib/db";
import { chicagolandCityWhere } from "@/lib/geo/chicagoland";
import { createDealerPromotion } from "@/lib/promotions";
import { usStateWhere } from "@/lib/outreach/regions";
import {
  autoStartOutreachDrips,
  processDueOutreachDrips,
} from "@/lib/outreach/drip";
import { dealerOutreachContext, sendDripEmail } from "@/lib/outreach/send-drip";
import { buildUpgradeNudgeEmail } from "@/lib/outreach/templates";
import { Resend } from "resend";
import { EMAILS, PRIMARY_INBOX } from "@/lib/constants/emails";

const MS_DAY = 24 * 60 * 60 * 1000;
const UPGRADE_NUDGE_TAG = "upgrade-nudge:";

function chicagolandWhere() {
  return {
    OR: [usStateWhere("Illinois"), chicagolandCityWhere()],
  };
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const FROM =
  process.env.EMAIL_FROM ||
  `DealerVoice <${EMAILS.dealers}>`;

async function promoCodeForDealer(dealershipId: string): Promise<string | undefined> {
  const promo = await prisma.promotionCode.findFirst({
    where: { dealershipId, active: true },
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });
  return promo?.code;
}

/** Claimed Chicagoland/IL dealers on FREE — nudge to upgrade with Inbox + AI pitch */
export async function sendChicagolandUpgradeNudges(limit = 40) {
  const since = new Date(Date.now() - 14 * MS_DAY);
  const dealers = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      claimedAt: { not: null },
      email: { not: null },
      NOT: { email: "" },
      AND: [
        chicagolandWhere(),
        {
          OR: [
            { subscription: null },
            { subscription: { plan: "FREE", status: "ACTIVE" } },
          ],
        },
        {
          OR: [
            { outreachNotes: null },
            { NOT: { outreachNotes: { contains: UPGRADE_NUDGE_TAG } } },
          ],
        },
        {
          OR: [{ lastOutreachAt: null }, { lastOutreachAt: { lt: since } }],
        },
      ],
    },
    take: limit,
    orderBy: { claimedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      cityName: true,
      stateName: true,
      phone: true,
      website: true,
      outreachNotes: true,
      country: { select: { code: true } },
    },
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const dealer of dealers) {
    if (!dealer.email?.includes("@")) continue;

    let promoCode = await promoCodeForDealer(dealer.id);
    if (!promoCode) {
      const promo = await createDealerPromotion(dealer.id).catch(() => null);
      promoCode = promo?.code;
    }

    const ctx = dealerOutreachContext(dealer);
    const { subject, body } = buildUpgradeNudgeEmail(ctx, promoCode);

    try {
      await getResend().emails.send({
        from: FROM,
        to: dealer.email,
        reply_to: PRIMARY_INBOX,
        subject,
        text: body,
        tags: [{ name: "outreach", value: "upgrade_nudge" }],
      });

      const stamp = `${UPGRADE_NUDGE_TAG}${new Date().toISOString().slice(0, 10)}`;
      await prisma.dealership.update({
        where: { id: dealer.id },
        data: {
          lastOutreachAt: new Date(),
          outreachStatus: "contacted",
          outreachNotes: dealer.outreachNotes
            ? `${dealer.outreachNotes}\n${stamp}`
            : stamp,
        },
      });
      sent++;
    } catch (err) {
      failed++;
      errors.push(`${dealer.name}: ${err instanceof Error ? err.message : "send failed"}`);
    }
  }

  return { candidates: dealers.length, sent, failed, errors: errors.slice(0, 5) };
}

export async function runChicagolandRevenuePush() {
  const [
    ilUnclaimed,
    ilContactedDrip,
    ilClaimedFree,
    paidSubs,
  ] = await Promise.all([
    prisma.dealership.count({
      where: { deletedAt: null, claimedAt: null, AND: [chicagolandWhere()], email: { not: null } },
    }),
    prisma.dealership.count({
      where: {
        deletedAt: null,
        claimedAt: null,
        AND: [chicagolandWhere()],
        outreachStatus: "contacted",
        outreachDripActive: true,
      },
    }),
    prisma.dealership.count({
      where: {
        deletedAt: null,
        claimedAt: { not: null },
        AND: [chicagolandWhere()],
        OR: [{ subscription: null }, { subscription: { plan: "FREE" } }],
      },
    }),
    prisma.dealerSubscription.count({
      where: { plan: { in: ["PRO", "PRO_PLUS", "ENTERPRISE"] }, status: "ACTIVE" },
    }),
  ]);

  const followUps = await processDueOutreachDrips(150);
  const autoStartIl = await autoStartOutreachDrips(75, "US", "Illinois");
  const upgradeNudges = await sendChicagolandUpgradeNudges(40);

  return {
    snapshot: {
      ilUnclaimedWithEmail: ilUnclaimed,
      ilContactedInDrip: ilContactedDrip,
      ilClaimedFree: ilClaimedFree,
      paidSubscriptionsActive: paidSubs,
    },
    followUps,
    autoStartIl,
    upgradeNudges,
  };
}
