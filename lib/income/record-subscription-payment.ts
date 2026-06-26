import { recordIncome } from "@/lib/income/ledger";
import type { SubscriptionPlan } from "@prisma/client";

export async function recordSubscriptionPayment(params: {
  dealershipId: string;
  plan: SubscriptionPlan;
  amountMinor: number;
  currency?: string;
  countryCode?: string | null;
  externalRef: string;
  description?: string;
}) {
  if (params.amountMinor <= 0) return null;

  return recordIncome({
    source: "SUBSCRIPTION",
    status: "CONFIRMED",
    amountMinor: params.amountMinor,
    currency: params.currency ?? "USD",
    countryCode: params.countryCode,
    dealershipId: params.dealershipId,
    description: params.description ?? `Stripe subscription payment — ${params.plan}`,
    externalRef: params.externalRef,
  });
}
