import prisma from "@/lib/db";
import { resolveAdHref } from "@/lib/ads/affiliate";
import {
  FALLBACK_AUTOMOTIVE_ADS,
  type AutomotiveAd,
  type AutomotiveAdType,
} from "@/lib/ads/automotive";

const VALID_TYPES: AutomotiveAdType[] = [
  "Tier2_OEM_Offer",
  "Sponsored_Local_Dealer",
  "Auto_Ecosystem_Partner",
];

export async function getAdForSlot(
  slot: string,
  type: AutomotiveAdType,
  countryCode?: string | null
): Promise<{ ad: AutomotiveAd; placementId?: string }> {
  const fallback = FALLBACK_AUTOMOTIVE_ADS[type];

  try {
    const placements = await prisma.adPlacement.findMany({
      where: {
        slot,
        adType: type,
        isActive: true,
        OR: countryCode
          ? [{ countryCode: countryCode.toUpperCase() }, { countryCode: null }]
          : [{ countryCode: null }],
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      take: 5,
    });

    const pick = placements.find((p) => p.countryCode === countryCode?.toUpperCase()) ?? placements[0];
    if (!pick) return { ad: { ...fallback, type } };

    return {
      placementId: pick.id,
      ad: {
        type,
        headline: pick.headline,
        subheadline: pick.subheadline,
        ctaLabel: pick.ctaLabel,
        ctaHref: resolveAdHref(pick.ctaHref, pick.affiliateRef, pick.affiliateParam),
        badge: pick.badge,
        accent: pick.accent,
      },
    };
  } catch {
    return { ad: { ...fallback, type } };
  }
}

export function isValidAdType(t: string): t is AutomotiveAdType {
  return VALID_TYPES.includes(t as AutomotiveAdType);
}

export async function getAdRevenueStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [clicks, impressions, placements] = await Promise.all([
    prisma.adClickEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { adType: true, slot: true, adPlacementId: true, createdAt: true },
    }),
    prisma.adImpressionEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.adPlacement.findMany({
      where: { isActive: true },
      select: { id: true, slot: true, adType: true, cpcEstimatePaise: true, headline: true },
    }),
  ]);

  const cpcMap = new Map(placements.map((p) => [p.id, p.cpcEstimatePaise ?? 0]));

  let estimatedRevenuePaise = 0;
  const bySlot: Record<string, { clicks: number; impressions: number; estRevenue: number }> = {};

  for (const c of clicks) {
    const cpc = c.adPlacementId ? (cpcMap.get(c.adPlacementId) ?? 0) : 0;
    estimatedRevenuePaise += cpc;
    if (!bySlot[c.slot]) bySlot[c.slot] = { clicks: 0, impressions: 0, estRevenue: 0 };
    bySlot[c.slot].clicks += 1;
    bySlot[c.slot].estRevenue += cpc / 100;
  }

  return {
    clicks30d: clicks.length,
    impressions30d: impressions,
    estimatedRevenue: estimatedRevenuePaise / 100,
    ctr: impressions > 0 ? Math.round((clicks.length / impressions) * 1000) / 10 : 0,
    bySlot,
    placements,
  };
}
