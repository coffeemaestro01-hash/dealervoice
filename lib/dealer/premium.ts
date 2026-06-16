export interface PremiumDealerFields {
  isPremiumClaimed?: boolean;
  inventoryUrl?: string | null;
  website?: string | null;
  subscription?: { plan: string; status?: string } | null;
}

/** True when profile is premium-claimed or on a paid plan (backward-compatible). */
export function isDealerPremiumClaimed(dealer: PremiumDealerFields): boolean {
  if (dealer.isPremiumClaimed) return true;
  const plan = dealer.subscription?.plan;
  return plan === "PRO" || plan === "PRO_PLUS" || plan === "ENTERPRISE";
}

export function getPremiumInventoryUrl(dealer: PremiumDealerFields): string | null {
  if (!isDealerPremiumClaimed(dealer)) return null;
  return dealer.inventoryUrl ?? dealer.website ?? null;
}
