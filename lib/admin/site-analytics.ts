import prisma from "@/lib/db";

export type AnalyticsPeriod = "24h" | "7d" | "30d" | "90d" | "all";

function periodStart(period: AnalyticsPeriod): Date | null {
  if (period === "all") return null;
  const hours = period === "24h" ? 24 : period === "7d" ? 168 : period === "30d" ? 720 : 2160;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function sinceFilter(period: AnalyticsPeriod) {
  const start = periodStart(period);
  return start ? { createdAt: { gte: start } } : {};
}

export async function getSiteAnalyticsOverview(period: AnalyticsPeriod = "30d") {
  const since = sinceFilter(period);
  const sessionSince = periodStart(period) ? { startedAt: { gte: periodStart(period)! } } : {};

  const [
    pageViews,
    uniqueSessions,
    uniqueVisitors,
    uniqueUsers,
    topPages,
    topPatterns,
    topReferrers,
    countries,
    devices,
    browsers,
    hourlyBuckets,
    recentEvents,
    adClicks,
    adImpressions,
    signups,
    reviews,
    claims,
    auditActions,
    activeSessions24h,
  ] = await Promise.all([
    prisma.siteEvent.count({ where: { eventType: "page_view", ...since } }),
    prisma.siteEvent.groupBy({
      by: ["sessionId"],
      where: { eventType: "page_view", sessionId: { not: null }, ...since },
      _count: { id: true },
    }),
    prisma.siteEvent.groupBy({
      by: ["visitorId"],
      where: { eventType: "page_view", visitorId: { not: null }, ...since },
      _count: { id: true },
    }),
    prisma.siteEvent.groupBy({
      by: ["userId"],
      where: { eventType: "page_view", userId: { not: null }, ...since },
      _count: { id: true },
    }),
    prisma.siteEvent.groupBy({
      by: ["path"],
      where: { eventType: "page_view", ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 100,
    }),
    prisma.siteEvent.groupBy({
      by: ["pathPattern"],
      where: { eventType: "page_view", pathPattern: { not: null }, ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 100,
    }),
    prisma.siteEvent.groupBy({
      by: ["referrer"],
      where: { eventType: "page_view", referrer: { not: null }, ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 50,
    }),
    prisma.siteEvent.groupBy({
      by: ["country"],
      where: { eventType: "page_view", country: { not: null }, ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 50,
    }),
    prisma.siteEvent.groupBy({
      by: ["device"],
      where: { eventType: "page_view", device: { not: null }, ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.siteEvent.groupBy({
      by: ["browser"],
      where: { eventType: "page_view", browser: { not: null }, ...since },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    getDailyPageViews(period),
    prisma.siteEvent.findMany({
      where: since,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        eventType: true,
        path: true,
        pathPattern: true,
        country: true,
        device: true,
        userRole: true,
        createdAt: true,
        sessionId: true,
        visitorId: true,
      },
    }),
    prisma.adClickEvent.count({ where: since }),
    prisma.adImpressionEvent.count({ where: since }),
    prisma.user.count({ where: { ...since, deletedAt: null } }),
    prisma.review.count({ where: { ...since, deletedAt: null } }),
    prisma.dealerClaim.count({ where: since }),
    prisma.auditLog.count({ where: since }),
    prisma.siteSession.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const avgPagesPerSession =
    uniqueSessions.length > 0 ? Math.round((pageViews / uniqueSessions.length) * 10) / 10 : 0;

  const eventTypeBreakdown = await prisma.siteEvent.groupBy({
    by: ["eventType"],
    where: since,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const topCities = await prisma.siteEvent.groupBy({
    by: ["city", "country"],
    where: { eventType: "page_view", city: { not: null }, ...since },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 30,
  });

  const sessionStats = await prisma.siteSession.aggregate({
    where: sessionSince,
    _avg: { pageViews: true },
    _count: { id: true },
  });

  return {
    period,
    pageViews,
    uniqueSessions: uniqueSessions.length,
    uniqueVisitors: uniqueVisitors.length,
    loggedInUsers: uniqueUsers.length,
    avgPagesPerSession,
    sessionCount: sessionStats._count.id,
    avgSessionDepth: Math.round((sessionStats._avg.pageViews ?? 0) * 10) / 10,
    activeSessions24h,
    adClicks,
    adImpressions,
    adCtr: adImpressions > 0 ? Math.round((adClicks / adImpressions) * 1000) / 10 : 0,
    signups,
    reviews,
    claims,
    auditActions,
    topPages: topPages.map((r) => ({ path: r.path, views: r._count.id })),
    topPatterns: topPatterns
      .filter((r) => r.pathPattern)
      .map((r) => ({ pattern: r.pathPattern!, views: r._count.id })),
    topReferrers: topReferrers
      .filter((r) => r.referrer)
      .map((r) => ({ referrer: r.referrer!, views: r._count.id })),
    countries: countries
      .filter((r) => r.country)
      .map((r) => ({ country: r.country!, views: r._count.id })),
    topCities: topCities.map((r) => ({
      city: r.city!,
      country: r.country,
      views: r._count.id,
    })),
    devices: devices
      .filter((r) => r.device)
      .map((r) => ({ device: r.device!, views: r._count.id })),
    browsers: browsers
      .filter((r) => r.browser)
      .map((r) => ({ browser: r.browser!, views: r._count.id })),
    eventTypes: eventTypeBreakdown.map((r) => ({ type: r.eventType, count: r._count.id })),
    dailyPageViews: hourlyBuckets,
    recentEvents,
  };
}

async function getDailyPageViews(period: AnalyticsPeriod) {
  const start = periodStart(period) ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const events = await prisma.siteEvent.findMany({
    where: { eventType: "page_view", createdAt: { gte: start } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const bucketMs =
    period === "24h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const map = new Map<string, number>();

  for (const e of events) {
    const t = e.createdAt.getTime();
    const key =
      period === "24h"
        ? new Date(Math.floor(t / bucketMs) * bucketMs).toISOString()
        : e.createdAt.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSiteEventsPage(opts: {
  period?: AnalyticsPeriod;
  eventType?: string;
  path?: string;
  page?: number;
  limit?: number;
}) {
  const { period = "30d", eventType, path, page = 1, limit = 200 } = opts;
  const cappedLimit = Math.min(Math.max(limit, 1), 1000);
  const where = {
    ...sinceFilter(period),
    ...(eventType ? { eventType } : {}),
    ...(path ? { path: { contains: path, mode: "insensitive" as const } } : {}),
  };

  const [total, events] = await Promise.all([
    prisma.siteEvent.count({ where }),
    prisma.siteEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * cappedLimit,
      take: cappedLimit,
    }),
  ]);

  return { total, page, limit: cappedLimit, pages: Math.ceil(total / cappedLimit), events };
}

export async function getConversionFunnel(period: AnalyticsPeriod = "30d") {
  const since = sinceFilter(period);
  const [home, dealers, profiles, writeReview, thankYou] = await Promise.all([
    prisma.siteEvent.count({ where: { eventType: "page_view", path: "/", ...since } }),
    prisma.siteEvent.count({ where: { eventType: "page_view", path: { startsWith: "/dealers" }, ...since } }),
    prisma.siteEvent.count({ where: { eventType: "page_view", path: { startsWith: "/dealership/" }, ...since } }),
    prisma.siteEvent.count({ where: { eventType: "page_view", path: { startsWith: "/write-review" }, ...since } }),
    prisma.siteEvent.count({ where: { eventType: "page_view", path: { startsWith: "/review-thank-you" }, ...since } }),
  ]);

  return [
    { step: "Homepage", count: home },
    { step: "Dealer search", count: dealers },
    { step: "Dealer profile", count: profiles },
    { step: "Write review", count: writeReview },
    { step: "Review submitted", count: thankYou },
  ];
}
