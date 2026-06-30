import type { SubscriptionPlan } from "@prisma/client";

export const INBOX_PRODUCT_NAME = "DealerVoice Inbox";
export const INBOX_BASE_PATH = "/ticketing";
export const INBOX_HOST = "ticketing.dealervoice.io";

export const INBOX_SEAT_LIMITS: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 5,
  PRO_PLUS: 10,
  ENTERPRISE: 50,
};

export const PAID_INBOX_PLANS: SubscriptionPlan[] = ["PRO", "PRO_PLUS", "ENTERPRISE"];

export function formatInboxTicketId(ticketNumber: number): string {
  return `DV-${String(ticketNumber).padStart(6, "0")}`;
}
