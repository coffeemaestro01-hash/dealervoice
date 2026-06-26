import { NextRequest, NextResponse } from "next/server";
import { discoverDealerEmailsBatch } from "@/lib/outreach/discover-emails";
import { autoStartOutreachDrips, processDueOutreachDrips } from "@/lib/outreach/drip";
import { nudgeDealersForReviews } from "@/lib/marketing/dealer-review-nudge";
import { backfillStripeSubscriptionIncome } from "@/lib/income/backfill-stripe";

/** Daily automated growth sprint — discovery, drips, review nudges, income sync. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = new Date().getUTCDay();
  const discovery =
    day === 2
      ? await discoverDealerEmailsBatch({ state: "Illinois", limit: 60 })
      : day === 4
        ? await discoverDealerEmailsBatch({ limit: 100 })
        : { scanned: 0, updated: 0, state: "skipped", skipped: true };

  let drip: Record<string, unknown> = { skipped: !process.env.RESEND_API_KEY };

  if (process.env.RESEND_API_KEY) {
    const followUps = await processDueOutreachDrips(75);
    const autoStartIl = await autoStartOutreachDrips(25, "US", "Illinois");
    const autoStartUs = await autoStartOutreachDrips(50, "US");
    drip = { followUps, autoStartIl, autoStartUs };
  }

  let nudges = { sent: 0, skipped: 0, candidates: 0 };
  if (process.env.RESEND_API_KEY) {
    nudges = await nudgeDealersForReviews(8);
  }

  let incomeBackfill = { recorded: 0, skipped: 0 };
  if (process.env.STRIPE_SECRET_KEY) {
    incomeBackfill = await backfillStripeSubscriptionIncome().catch(() => ({ recorded: 0, skipped: 0, error: true }));
  }

  return NextResponse.json({
    ok: true,
    discovery,
    drip,
    nudges,
    incomeBackfill,
    ranAt: new Date().toISOString(),
  });
}
