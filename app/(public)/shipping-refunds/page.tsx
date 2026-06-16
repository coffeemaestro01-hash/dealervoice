import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellations & Refunds",
  description: "Cancellation, refund, and billing dispute terms for DealerVoice B2B subscriptions billed in USD via Stripe.",
};

export default function ShippingRefundsPage() {
  return (
    <div className="bg-card">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Cancellations &amp; <span className="text-primary">Refunds</span></h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026 · Billed in USD via Stripe</p>

        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            DealerVoice sells <strong>digital B2B subscription services</strong> to automotive dealerships.
            No physical goods are shipped. All subscription charges are processed in <strong>USD</strong> through Stripe.
          </p>
          <section>
            <h2 className="text-xl font-bold text-foreground">Subscriptions &amp; billing</h2>
            <p>Paid plans are billed in advance on a recurring (monthly or annual) basis. Applicable sales tax may be calculated at checkout where required by law. Invoices and receipts are available from your dealer dashboard and Stripe.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">Cancellation</h2>
            <p>You may cancel anytime from your dashboard or by emailing <a href="mailto:billing@dealervoice.io" className="text-primary hover:underline">billing@dealervoice.io</a>. Access continues until the end of the current billing period; the plan does not renew thereafter.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">Refunds</h2>
            <p>Because access is granted immediately, fees are generally non-refundable except where required by law or in cases of duplicate or erroneous charges. Approved refunds are returned to the original payment method within 5–10 business days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">Disputes</h2>
            <p>Billing disputes can be raised at <a href="mailto:billing@dealervoice.io" className="text-primary hover:underline">billing@dealervoice.io</a> or via our <a href="/contact" className="text-primary hover:underline">contact page</a>. We aim to respond within 5 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
