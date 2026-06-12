import { getAdForSlot } from "@/lib/ads/placements";
import type { AutomotiveAdType } from "@/lib/ads/automotive";
import { AdBannerClient } from "@/components/ads/AdBannerClient";
import type { AutomotiveAd } from "@/lib/ads/automotive";

interface Props {
  type: AutomotiveAdType;
  ad?: Partial<AutomotiveAd>;
  className?: string;
  compact?: boolean;
  slot?: string;
  countryCode?: string | null;
}

function trackedHref(
  type: AutomotiveAdType,
  slot: string,
  destination: string,
  placementId?: string
) {
  const params = new URLSearchParams({ type, slot, redirect: destination });
  if (placementId) params.set("placementId", placementId);
  return `/api/ads/click?${params.toString()}`;
}

export async function AutomotiveAdBanner({
  type,
  ad,
  className,
  compact,
  slot = "homepage",
  countryCode = "US",
}: Props) {
  const { ad: resolved, placementId } = await getAdForSlot(slot, type, countryCode);
  const content: AutomotiveAd = { ...resolved, ...ad, type };
  const href = trackedHref(type, slot, content.ctaHref, placementId);

  return (
    <AdBannerClient
      content={content}
      href={href}
      className={className}
      compact={compact}
      placementId={placementId}
      slot={slot}
    />
  );
}
