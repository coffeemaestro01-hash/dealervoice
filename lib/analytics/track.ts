import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { normalizePath } from "@/lib/analytics/paths";
import type { ParsedRequestMeta } from "@/lib/analytics/parse-request";

export interface TrackEventInput {
  eventType: string;
  path: string;
  queryString?: string | null;
  method?: string;
  statusCode?: number | null;
  sessionId?: string | null;
  visitorId?: string | null;
  userId?: string | null;
  userRole?: string | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown> | null;
  meta: ParsedRequestMeta;
}

export async function recordSiteEvent(input: TrackEventInput) {
  const pathPattern = normalizePath(input.path.split("?")[0]);

  const event = await prisma.siteEvent.create({
    data: {
      eventType: input.eventType,
      path: input.path,
      pathPattern,
      queryString: input.queryString ?? null,
      method: input.method ?? "GET",
      statusCode: input.statusCode ?? null,
      sessionId: input.sessionId ?? null,
      visitorId: input.visitorId ?? null,
      userId: input.userId ?? null,
      userRole: input.userRole ?? null,
      ipAddress: input.meta.ipAddress,
      country: input.meta.country,
      region: input.meta.region,
      city: input.meta.city,
      device: input.meta.device,
      browser: input.meta.browser,
      os: input.meta.os,
      referrer: input.meta.referrer,
      utmSource: input.meta.utmSource,
      utmMedium: input.meta.utmMedium,
      utmCampaign: input.meta.utmCampaign,
      durationMs: input.durationMs ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  if (input.sessionId) {
    await upsertSession(input);
  }

  return event;
}

async function upsertSession(input: TrackEventInput) {
  const sid = input.sessionId!;
  const existing = await prisma.siteSession.findUnique({ where: { sessionId: sid } });

  if (existing) {
    await prisma.siteSession.update({
      where: { sessionId: sid },
      data: {
        lastSeenAt: new Date(),
        pageViews: input.eventType === "page_view" ? { increment: 1 } : undefined,
        exitPath: input.path.split("?")[0],
        userId: input.userId ?? existing.userId,
        userRole: input.userRole ?? existing.userRole,
      },
    });
    return;
  }

  await prisma.siteSession.create({
    data: {
      sessionId: sid,
      visitorId: input.visitorId,
      userId: input.userId,
      userRole: input.userRole,
      entryPath: input.path.split("?")[0],
      exitPath: input.path.split("?")[0],
      pageViews: input.eventType === "page_view" ? 1 : 0,
      referrer: input.meta.referrer,
      utmSource: input.meta.utmSource,
      utmMedium: input.meta.utmMedium,
      utmCampaign: input.meta.utmCampaign,
      country: input.meta.country,
      region: input.meta.region,
      city: input.meta.city,
      device: input.meta.device,
      browser: input.meta.browser,
      os: input.meta.os,
      ipAddress: input.meta.ipAddress,
    },
  });
}
