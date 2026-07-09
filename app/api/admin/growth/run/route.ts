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
import { logAdminJobRun } from "@/lib/admin/business-tracking";

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
    let result: unknown;
    switch (action) {
      case "import_chicagoland":
        result = await importChicagolandFromOsm();
        break;
      case "discover_chicagoland":
        result = await discoverDealerEmailsBatch({ region: "chicagoland", limit: 250 });
        break;
      case "discover_il":
        result = await discoverDealerEmailsBatch({
          region: "illinois",
          limit: 300,
          useApifyFallback: true,
          apifyMaxUrls: 50,
          autoStartDrip: true,
        });
        break;
      case "discover_us":
        result = await discoverDealerEmailsBatch({ limit: 400 });
        break;
      case "drip": {
        const followUps = await processDueOutreachDrips(150);
        const il = await autoStartOutreachDrips(50, "US", "Illinois");
        const us = await autoStartOutreachDrips(100, "US");
        result = { followUps, il, us };
        break;
      }
      case "nudge_reviews":
        result = await nudgeDealersForReviews(30);
        break;
      case "outreach_buyers":
        result = await outreachBuyersForReviews(200);
        break;
      case "backfill_income":
        result = await backfillStripeSubscriptionIncome();
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const jobType =
      action === "drip"
        ? "OUTREACH_DRIP"
        : action.startsWith("discover")
          ? "EMAIL_DISCOVERY"
          : action === "outreach_buyers"
            ? "BUYER_OUTREACH"
            : "GROWTH_ACTION";

    await logAdminJobRun({
      jobType,
      summary: `Growth action: ${action}`,
      payload: result as object,
      actorUserId: session.user.id,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
