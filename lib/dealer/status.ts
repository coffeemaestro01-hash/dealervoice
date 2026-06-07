import type { DealerStatus } from "@prisma/client";

/** Dealerships visible in public search, maps, and directory pages. */
export const PUBLIC_DEALER_STATUSES: DealerStatus[] = ["ACTIVE", "CLAIMED"];

export const publicDealerWhere = {
  deletedAt: null,
  status: { in: PUBLIC_DEALER_STATUSES },
} as const;
