import { NextRequest, NextResponse } from "next/server";
import { discoverDealerEmailsBatch } from "@/lib/outreach/discover-emails";
import { autoStartOutreachDrips, processDueOutreachDrips } from "@/lib/outreach/drip";
import { nudgeDealersForReviews } from "@/lib/marketing/dealer-review-nudge";
import { outreachBuyersForReviews } from "@/lib/marketing/buyer-review-outreach";
import { backfillStripeSubscriptionIncome } from "@/lib/income/backfill-stripe";

/** Daily automated growth sprint — discovery, drips, review nudges, income sync. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = new Date().getUTCDay();

  // Bulk email discovery — Chicagoland priority
  const discovery =
    day === 1 || day === 3 || day === 5
      ? await discoverDealerEmailsBatch({ region: "chicagoland", limit: 200 })
      : day === 2
        ? await discoverDealerEmailsBatch({
            region: "illinois",
            limit: 250,
            useApifyFallback: true,
            apifyMaxUrls: 40,
            autoStartDrip: true,
          })
        : day === 4
          ? await discoverDealerEmailsBatch({ limit: 300 })
          : { scanned: 0, updated: 0, state: "weekend-pause" };

  let drip: Record<string, unknown> = { skipped: !process.env.RESEND_API_KEY };

  if (process.env.RESEND_API_KEY) {
    const followUps = await processDueOutreachDrips(150);
    const autoStartMetro = await autoStartOutreachDrips(50, "US", "Illinois");
    const autoStartUs = await autoStartOutreachDrips(100, "US");
    drip = { followUps, autoStartMetro, autoStartUs };
  }

  let nudges = { sent: 0, skipped: 0, candidates: 0 };
  let buyers = { sent: 0, candidates: 0 };
  if (process.env.RESEND_API_KEY) {
    nudges = await nudgeDealersForReviews(20);
    buyers = await outreachBuyersForReviews(100);
  }

  let incomeBackfill = { recorded: 0, skipped: 0 };
  if (process.env.STRIPE_SECRET_KEY) {
    incomeBackfill = await backfillStripeSubscriptionIncome().catch(() => ({ recorded: 0, skipped: 0 }));
  }

  return NextResponse.json({
    ok: true,
    discovery,
    drip,
    nudges,
    buyers,
    incomeBackfill,
    ranAt: new Date().toISOString(),
  });
}
