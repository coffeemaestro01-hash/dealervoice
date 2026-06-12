import prisma from "@/lib/db";
import { getStripe } from "@/lib/payment";
import { recordIncome } from "@/lib/income/ledger";

/** Default qualified lead fee in USD cents */
export const DEFAULT_LEAD_FEE_USD_CENTS = 4900; // $49

export async function billLeadOnConversion(leadId: string, recordedById?: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      dealership: {
        select: {
          id: true,
          name: true,
          country: { select: { code: true } },
          subscription: { select: { stripeCustomerId: true, status: true, plan: true } },
        },
      },
    },
  });

  if (!lead || lead.feeChargedAt) return { billed: false, reason: "already_billed_or_missing" as const };
  if (lead.status !== "CONVERTED") return { billed: false, reason: "not_converted" as const };

  const feeCents = lead.feeCents ?? DEFAULT_LEAD_FEE_USD_CENTS;
  const customerId = lead.dealership.subscription?.stripeCustomerId;

  if (!customerId) {
    await recordIncome({
      source: "LEAD_FEE",
      status: "ESTIMATED",
      amountMinor: feeCents,
      currency: "USD",
      countryCode: lead.dealership.country?.code ?? "US",
      dealershipId: lead.dealershipId,
      description: `Lead fee pending — ${lead.name} (no Stripe customer on file)`,
      externalRef: `lead-pending-${lead.id}`,
      metadata: { leadId: lead.id, name: lead.name },
      recordedById,
    });
    return { billed: false, reason: "no_stripe_customer" as const };
  }

  const stripe = getStripe();
  const externalRef = `lead-${lead.id}`;

  await stripe.invoiceItems.create({
    customer: customerId,
    amount: feeCents,
    currency: "usd",
    description: `DealerVoice lead fee — ${lead.name} (${lead.type})`,
    metadata: { leadId: lead.id, dealershipId: lead.dealershipId },
  });

  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
    collection_method: "charge_automatically",
    metadata: { type: "lead_fee", leadId: lead.id, dealershipId: lead.dealershipId },
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
  if (finalized.status === "open") {
    await stripe.invoices.pay(finalized.id).catch(() => {});
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      feeCents,
      feeChargedAt: new Date(),
      feeExternalRef: externalRef,
    },
  });

  await recordIncome({
    source: "LEAD_FEE",
    status: "CONFIRMED",
    amountMinor: feeCents,
    currency: "USD",
    countryCode: lead.dealership.country?.code ?? "US",
    dealershipId: lead.dealershipId,
    description: `Lead fee — ${lead.name}`,
    externalRef,
    metadata: { leadId: lead.id, stripeInvoiceId: finalized.id },
    recordedById,
  });

  return { billed: true, invoiceId: finalized.id };
}

export async function markLeadConverted(leadId: string, userId?: string) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status: "CONVERTED" },
  });
  const billing = await billLeadOnConversion(leadId, userId);
  return { lead, billing };
}
