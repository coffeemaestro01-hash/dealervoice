import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using DealerVoice.",
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of <span className="text-gold">Service</span></h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900">1. Acceptance of terms</h2>
            <p>By accessing or using DealerVoice, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">2. Writing reviews</h2>
            <p>Reviews must reflect a genuine experience with the dealership. You agree not to post false, defamatory, or misleading content, and not to accept compensation in exchange for reviews. We may remove content that violates these rules.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">3. Dealership profiles</h2>
            <p>Businesses may claim and manage their profile after verification. Claiming a profile does not allow a business to remove or alter genuine customer reviews, only to respond to them.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">4. Acceptable use</h2>
            <p>You agree not to misuse the platform, including scraping data without permission, attempting to manipulate ratings, or interfering with the service&apos;s operation.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">5. Subscriptions & payments</h2>
            <p>Paid plans are billed in advance on a recurring basis through our payment provider. You may cancel at any time; access continues until the end of the current billing period. Fees are non-refundable except where required by law.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">6. Disclaimers</h2>
            <p>DealerVoice is provided &quot;as is.&quot; Reviews reflect the opinions of individual users, not DealerVoice. We do not guarantee the accuracy of any review or rating.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">7. Changes</h2>
            <p>We may update these terms from time to time. Continued use after changes constitutes acceptance. Questions? Email <a href="mailto:legal@dealervoice.com" className="text-gold-700 hover:underline">legal@dealervoice.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
