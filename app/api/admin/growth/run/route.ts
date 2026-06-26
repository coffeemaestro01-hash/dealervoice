import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { isStaffRole } from "@/lib/admin/permissions";
import { discoverDealerEmailsBatch } from "@/lib/outreach/discover-emails";
import { autoStartOutreachDrips, processDueOutreachDrips } from "@/lib/outreach/drip";
import { nudgeDealersForReviews } from "@/lib/marketing/dealer-review-nudge";
import { outreachBuyersForReviews } from "@/lib/marketing/buyer-review-outreach";
import { backfillStripeSubscriptionIncome } from "@/lib/income/backfill-stripe";
import { importChicagolandFromOsm } from "@/lib/geo/import-chicagoland-job";

const ACTIONS = [
  "import_chicagoland",
  "discover_chicagoland",
  "discover_il",
  "discover_us",
  "drip",
  "nudge_reviews",
  "outreach_buyers",
  "backfill_income",
] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["SUPER_ADMIN", "REVENUE"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const action = body.action as Action;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  try {
    switch (action) {
      case "import_chicagoland":
        return NextResponse.json({ ok: true, result: await importChicagolandFromOsm() });
      case "discover_chicagoland":
        return NextResponse.json({
          ok: true,
          result: await discoverDealerEmailsBatch({ region: "chicagoland", limit: 250 }),
        });
      case "discover_il":
        return NextResponse.json({
          ok: true,
          result: await discoverDealerEmailsBatch({ region: "illinois", limit: 300 }),
        });
      case "discover_us":
        return NextResponse.json({ ok: true, result: await discoverDealerEmailsBatch({ limit: 400 }) });
      case "drip": {
        const followUps = await processDueOutreachDrips(150);
        const il = await autoStartOutreachDrips(50, "US", "Illinois");
        const us = await autoStartOutreachDrips(100, "US");
        return NextResponse.json({ ok: true, result: { followUps, il, us } });
      }
      case "nudge_reviews":
        return NextResponse.json({ ok: true, result: await nudgeDealersForReviews(30) });
      case "outreach_buyers":
        return NextResponse.json({ ok: true, result: await outreachBuyersForReviews(200) });
      case "backfill_income":
        return NextResponse.json({ ok: true, result: await backfillStripeSubscriptionIncome() });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
