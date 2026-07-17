/**
 * Local growth sprint — same actions as /api/cron/growth-sprint.
 * Usage: npx tsx scripts/run-growth-sprint-local.ts
 */
import { loadProjectEnv } from "./load-env";
loadProjectEnv();

async function main() {
  const { discoverDealerEmailsBatch } = await import("@/lib/outreach/discover-emails");
  const { autoStartOutreachDrips, processDueOutreachDrips } = await import("@/lib/outreach/drip");
  const { nudgeDealersForReviews } = await import("@/lib/marketing/dealer-review-nudge");
  const { outreachBuyersForReviews } = await import("@/lib/marketing/buyer-review-outreach");
  const { backfillStripeSubscriptionIncome } = await import("@/lib/income/backfill-stripe");

  const day = new Date().getUTCDay();
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

  console.log(JSON.stringify({ ok: true, discovery, drip, nudges, buyers, incomeBackfill }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
