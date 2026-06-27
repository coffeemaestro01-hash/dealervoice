import type { Metadata } from "next";
import { COMPANY, companyHqLine } from "@/lib/constants/company";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using DealerVoice.",
};

export default function TermsPage() {
  return (
    <div className="bg-background">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Terms of <span className="text-primary">Service</span></h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 2026</p>

        <div className="max-w-none space-y-6 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of terms</h2>
            <p>By accessing or using DealerVoice, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">2. Writing reviews</h2>
            <p>Reviews must reflect a genuine experience with the dealership. You agree not to post false, defamatory, or misleading content, and not to accept compensation in exchange for reviews. We may remove content that violates these rules.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">3. Dealership profiles</h2>
            <p>Businesses may claim and manage their profile after verification. Claiming a profile does not allow a business to remove or alter genuine customer reviews, only to respond to them.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">4. Acceptable use</h2>
            <p>You agree not to misuse the platform, including scraping data without permission, attempting to manipulate ratings, or interfering with the service&apos;s operation.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">5. Subscriptions &amp; payments</h2>
            <p>Paid plans are billed in USD on a recurring basis through Stripe. You may cancel at any time from your dashboard; access continues until the end of the current billing period. Fees are non-refundable except where required by law. See our <a href="/shipping-refunds" className="text-primary hover:underline">Cancellations &amp; Refunds</a> policy.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">6. Dealer promotions</h2>
            <p>
              From time to time DealerVoice offers promotional programs for dealerships, including the{" "}
              <strong>Chicagoland Dealership Promotion</strong> and billing-period bonuses. Eligibility, review
              verification requirements, slot limits, and ongoing compliance rules are described on our{" "}
              <a href="/promotions" className="text-primary hover:underline">Promotions</a> page and in your dealer
              dashboard. Promotions apply only to claimed dealership profiles, may be modified or ended with notice, and
              are limited to one redemption per dealership unless stated otherwise. Failure to meet post-qualification
              requirements (such as minimum monthly verified reviews) may result in forfeiture of promotional benefits.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">7. Disclaimers</h2>
            <p>DealerVoice is provided &quot;as is.&quot; Reviews reflect the opinions of individual users, not DealerVoice. We do not guarantee the accuracy of any review or rating.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">8. Governing law</h2>
            <p>These terms are governed by the laws of the {COMPANY.governingLaw}, without regard to conflict-of-law principles. {COMPANY.name} is operated from {companyHqLine()} and serves users worldwide.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">9. Changes</h2>
            <p>We may update these terms from time to time. Continued use after changes constitutes acceptance. Questions? Email <a href="mailto:legal@dealervoice.io" className="text-primary hover:underline">legal@dealervoice.io</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
