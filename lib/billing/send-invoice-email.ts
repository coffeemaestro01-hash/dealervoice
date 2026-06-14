import { Resend } from "resend";
import prisma from "@/lib/db";
import { APP_URL, EMAILS } from "@/lib/constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

const BILLING_FROM =
  process.env.BILLING_EMAIL_FROM || `DealerVoice Billing <${EMAILS.billing}>`;

function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function invoiceEmailHtml(params: {
  dealerName: string;
  invoiceNumber: string;
  amount: string;
  description: string;
  pdfUrl?: string | null;
  billingUrl: string;
}): string {
  const pdfLink = params.pdfUrl
    ? `<p><a href="${params.pdfUrl}" style="color:#C9961E">Download PDF invoice</a></p>`
    : "";
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.header{background:#0a0a0a;padding:24px;text-align:center}
.header h1{color:#D4AF37;margin:0;font-size:24px}
.body{padding:32px;color:#374151;line-height:1.6}
.footer{background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="container">
<div class="header"><h1>DealerVoice Billing</h1></div>
<div class="body">
<h2>Invoice ${params.invoiceNumber}</h2>
<p>Hi,</p>
<p>Your payment for <strong>${params.dealerName}</strong> has been processed.</p>
<p><strong>Amount:</strong> ${params.amount}<br/>
<strong>Description:</strong> ${params.description}</p>
${pdfLink}
<p><a href="${params.billingUrl}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View billing dashboard</a></p>
<p style="color:#777;font-size:14px;margin-top:24px">Questions? Reply to this email or contact <a href="mailto:${EMAILS.support}" style="color:#C9961E">${EMAILS.support}</a>.</p>
</div>
<div class="footer"><p>© ${new Date().getFullYear()} DealerVoice. All rights reserved.</p></div>
</div></body></html>`;
}

export async function sendDealerInvoiceEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      dealership: {
        select: {
          name: true,
          staff: {
            where: { isActive: true },
            include: { user: { select: { email: true, name: true } } },
          },
        },
      },
    },
  });

  if (!invoice || invoice.emailSentAt) return { sent: false, reason: "missing_or_already_sent" as const };

  const ownerStaff =
    invoice.dealership.staff.find((s) => s.role === "owner") ??
    invoice.dealership.staff[0];
  const to = ownerStaff?.user.email;
  if (!to) return { sent: false, reason: "no_recipient" as const };

  const billingUrl = `${APP_URL}/dashboard/dealer/billing`;
  const amount = formatAmount(invoice.amount, invoice.currency);
  const description =
    invoice.description ??
    (invoice.type === "SUBSCRIPTION"
      ? "DealerVoice subscription"
      : invoice.type === "LEAD_FEE"
        ? "Qualified lead fee"
        : "DealerVoice sponsorship");

  await resend.emails.send({
    from: BILLING_FROM,
    to,
    reply_to: EMAILS.billing,
    subject: `Invoice ${invoice.invoiceNumber ?? invoice.id} — ${amount}`,
    html: invoiceEmailHtml({
      dealerName: invoice.dealership.name,
      invoiceNumber: invoice.invoiceNumber ?? invoice.id,
      amount,
      description,
      pdfUrl: invoice.pdfUrl,
      billingUrl,
    }),
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { emailSentAt: new Date() },
  });

  return { sent: true };
}
