import prisma from "@/lib/db";
import type { InvoiceType } from "@prisma/client";

export interface RecordDealerInvoiceInput {
  dealershipId: string;
  subscriptionId?: string | null;
  stripeInvoiceId?: string | null;
  type: InvoiceType;
  description?: string | null;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string | null;
  invoiceDate: Date;
  paidAt?: Date | null;
}

async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DV-${year}-`;
  const latest = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const seq = latest?.invoiceNumber
    ? Number(latest.invoiceNumber.slice(prefix.length)) + 1
    : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

export async function recordDealerInvoice(input: RecordDealerInvoiceInput) {
  if (input.stripeInvoiceId) {
    const existing = await prisma.invoice.findUnique({
      where: { stripeInvoiceId: input.stripeInvoiceId },
    });
    if (existing) {
      return prisma.invoice.update({
        where: { id: existing.id },
        data: {
          status: input.status,
          pdfUrl: input.pdfUrl ?? existing.pdfUrl,
          paidAt: input.paidAt ?? existing.paidAt,
          description: input.description ?? existing.description,
          amount: input.amount,
          currency: input.currency,
        },
      });
    }
  }

  const invoiceNumber = await nextInvoiceNumber();
  return prisma.invoice.create({
    data: {
      dealershipId: input.dealershipId,
      subscriptionId: input.subscriptionId ?? undefined,
      stripeInvoiceId: input.stripeInvoiceId ?? undefined,
      type: input.type,
      description: input.description ?? undefined,
      invoiceNumber,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      pdfUrl: input.pdfUrl ?? undefined,
      invoiceDate: input.invoiceDate,
      paidAt: input.paidAt ?? undefined,
    },
  });
}
