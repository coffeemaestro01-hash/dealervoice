import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellations & Refunds",
  description: "Cancellation, refund, and dispute terms for DealerVoice subscriptions, under the Consumer Protection (E-Commerce) Rules 2020.",
};

export default function ShippingRefundsPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Cancellations &amp; <span className="text-gold">Refunds</span></h1>
        <p className="text-sm text-gray-500 mb-10">Consumer Protection (E-Commerce) Rules 2020</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            DealerVoice sells <strong>digital subscription services</strong> to dealerships (no physical goods are shipped). The terms below govern those subscriptions.
          </p>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Subscriptions &amp; billing</h2>
            <p>Paid plans are billed in advance on a recurring (monthly or annual) basis through our payment provider. Applicable taxes (incl. GST, once registered) are shown at checkout and on every invoice.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Cancellation</h2>
            <p>You may cancel anytime from your dashboard or by emailing <a href="mailto:billing@dealervoice.io" className="text-gold-700 hover:underline">billing@dealervoice.io</a>. Access continues until the end of the current billing period; the plan does not renew thereafter.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Refunds</h2>
            <p>Because access is granted immediately, fees are generally non-refundable except where required by law or in cases of duplicate/erroneous charges. Approved refunds are returned to the original payment method within 5–7 business days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Disputes</h2>
            <p>Billing disputes can be raised at <a href="mailto:billing@dealervoice.io" className="text-gold-700 hover:underline">billing@dealervoice.io</a> or via our <a href="/grievance" className="text-gold-700 hover:underline">grievance channel</a>. We aim to resolve billing grievances within 15 days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
