import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getSiteAnalyticsOverview,
  getSiteEventsPage,
  getConversionFunnel,
  type AnalyticsPeriod,
} from "@/lib/admin/site-analytics";

const PERIODS = new Set(["24h", "7d", "30d", "90d", "all"]);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "overview";
  const period = (searchParams.get("period") ?? "30d") as AnalyticsPeriod;
  if (!PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  if (mode === "events") {
    const data = await getSiteEventsPage({
      period,
      eventType: searchParams.get("eventType") ?? undefined,
      path: searchParams.get("path") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 200),
    });
    return NextResponse.json({ data });
  }

  if (mode === "funnel") {
    const data = await getConversionFunnel(period);
    return NextResponse.json({ data });
  }

  const data = await getSiteAnalyticsOverview(period);
  return NextResponse.json({ data });
}
