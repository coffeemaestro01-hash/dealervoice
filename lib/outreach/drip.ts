import prisma from "@/lib/db";
import { createDealerPromotion } from "@/lib/promotions";
import {
  dealerOutreachContext,
  DRIP_STEP_DELAYS_DAYS,
  sendDripEmail,
} from "@/lib/outreach/send-drip";
import type { DripStep } from "@/lib/outreach/templates";

const MS_DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_DAY);
}

type DealerRow = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  cityName: string | null;
  stateName: string | null;
  phone: string | null;
  website: string | null;
  outreachDripStep: number;
  country: { code: string };
};

async function loadDealer(dealershipId: string): Promise<DealerRow | null> {
  return prisma.dealership.findFirst({
    where: { id: dealershipId, deletedAt: null, claimedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      cityName: true,
      stateName: true,
      phone: true,
      website: true,
      outreachDripStep: true,
      country: { select: { code: true } },
    },
  });
}

async function promoCodeForDealer(dealershipId: string): Promise<string | undefined> {
  const promo = await prisma.promotionCode.findFirst({
    where: { dealershipId, active: true },
    orderBy: { createdAt: "desc" },
    select: { code: true },
  });
  return promo?.code;
}

/** Send one drip step and advance dealer state */
export async function sendOutreachDripStep(
  dealer: DealerRow,
  step: DripStep,
  createdById?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!dealer.email?.includes("@")) {
    return { ok: false, error: "No email on file" };
  }

  let promoCode: string | undefined;
  if (step === 3) {
    const promo = await createDealerPromotion(dealer.id, createdById).catch(() => null);
    promoCode = promo?.code ?? (await promoCodeForDealer(dealer.id));
  }

  const ctx = dealerOutreachContext(dealer);
  try {
    await sendDripEmail(dealer.email, ctx, step, promoCode);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return { ok: false, error: message };
  }

  const now = new Date();
  const isComplete = step >= 3;
  await prisma.dealership.update({
    where: { id: dealer.id },
    data: {
      outreachDripStep: step,
      outreachDripActive: !isComplete,
      outreachDripStartedAt: step === 1 ? now : undefined,
      nextOutreachAt: isComplete ? null : addDays(now, DRIP_STEP_DELAYS_DAYS[step as 1 | 2]),
      lastOutreachAt: now,
      outreachStatus: "contacted",
    },
  });

  return { ok: true };
}

/** Start the 3-email drip — sends step 1 immediately */
export async function startOutreachDrip(dealershipId: string, createdById?: string) {
  const dealer = await loadDealer(dealershipId);
  if (!dealer) return { ok: false, error: "Dealer not found or already claimed" };
  if (dealer.outreachDripStep > 0) {
    return { ok: false, error: "Drip already started for this dealer" };
  }
  return sendOutreachDripStep(dealer, 1, createdById);
}

/** Process due follow-up emails (steps 2 and 3) */
export async function processDueOutreachDrips(limit = 50) {
  const now = new Date();
  const due = await prisma.dealership.findMany({
    where: {
      deletedAt: null,
      claimedAt: null,
      outreachDripActive: true,
      outreachDripStep: { in: [1, 2] },
      nextOutreachAt: { lte: now },
      outreachStatus: { not: "skipped" },
      email: { not: null },
      NOT: { email: "" },
    },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      cityName: true,
      stateName: true,
      phone: true,
      website: true,
      outreachDripStep: true,
      country: { select: { code: true } },
    },
  });

  let sent = 0;
  let failed = 0;
  for (const dealer of due) {
    const nextStep = (dealer.outreachDripStep + 1) as DripStep;
    const result = await sendOutreachDripStep(dealer, nextStep);
    if (result.ok) sent++;
    else failed++;
  }
  return { processed: due.length, sent, failed };
}

/** Auto-enroll US unclaimed dealers with email who haven't started a drip yet */
export async function autoStartOutreachDrips(limit = 20, countryCode = "US") {
  const country = await prisma.country.findUnique({
    where: { code: countryCode },
    select: { id: true },
  });
  if (!country) return { started: 0, errors: 0 };

  const candidates = await prisma.dealership.findMany({
    where: {
      countryId: country.id,
      deletedAt: null,
      claimedAt: null,
      outreachDripStep: 0,
      outreachDripActive: false,
      outreachStatus: { not: "skipped" },
      email: { not: null },
      NOT: { email: "" },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      cityName: true,
      stateName: true,
      phone: true,
      website: true,
      outreachDripStep: true,
      country: { select: { code: true } },
    },
  });

  let started = 0;
  let errors = 0;
  for (const dealer of candidates) {
    const result = await sendOutreachDripStep(dealer, 1);
    if (result.ok) started++;
    else errors++;
  }
  return { started, errors, candidates: candidates.length };
}
