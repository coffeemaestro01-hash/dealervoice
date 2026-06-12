import type { DealerStatus } from "@prisma/client";

/** Dealerships visible in public search, maps, and directory pages. */
export const PUBLIC_DEALER_STATUSES: DealerStatus[] = ["ACTIVE", "CLAIMED"];

export const publicDealerWhere = {
  deletedAt: null,
  status: { in: PUBLIC_DEALER_STATUSES },
  isPublished: true,
} as const;

/** When true, directory hides independent / non-franchise rooftops. */
export const FRANCHISED_ONLY_PUBLIC =
  process.env.NEXT_PUBLIC_FRANCHISED_ONLY === "true" ||
  process.env.FRANCHISED_ONLY === "true";

export function publicDealerFilter() {
  return {
    ...publicDealerWhere,
    ...(FRANCHISED_ONLY_PUBLIC ? { isFranchised: true } : {}),
  };
}
