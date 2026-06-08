/** Google AdSense — env-driven; inactive until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set. */

export type AdSenseSlotKey = "blogInArticle" | "blogList" | "dealerSidebar";

const SLOT_ENV: Record<AdSenseSlotKey, string | undefined> = {
  blogInArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_IN_ARTICLE,
  blogList: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST,
  dealerSidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEALER_SIDEBAR,
};

const DEFAULT_CLIENT_ID = "ca-pub-7018496304938556";

export function getAdSenseClientId(): string | null {
  const id = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || DEFAULT_CLIENT_ID).trim();
  if (!id.startsWith("ca-pub-")) return null;
  return id;
}

/** ads.txt uses pub-XXXXXXXX format (strip ca- prefix). */
export function getAdSensePublisherId(): string | null {
  const clientId = getAdSenseClientId();
  if (!clientId) return null;
  return clientId.replace(/^ca-/, "");
}

export function isAdSenseConfigured(): boolean {
  return !!getAdSenseClientId();
}

export function getAdSenseSlotId(key: AdSenseSlotKey): string | null {
  const slot = SLOT_ENV[key]?.trim();
  return slot || null;
}

export function isAdSenseSlotConfigured(key: AdSenseSlotKey): boolean {
  return !!getAdSenseSlotId(key);
}
