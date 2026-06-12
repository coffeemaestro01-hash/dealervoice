import type { Metadata } from "next";
import { COMPANY, companyHqLine } from "@/lib/constants/company";

export const metadata: Metadata = {
  title: "Review Standards & Integrity",
  description: "How DealerVoice collects, verifies, and publishes dealership reviews — operated from Illinois, USA.",
};

export default function ReviewStandardsPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Review <span className="text-gold">standards</span>
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          {COMPANY.name} · Operated from {companyHqLine()}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            {COMPANY.name} is built in {COMPANY.hqCity}, {COMPANY.hqState}, and serves dealerships and car buyers
            worldwide. Our review practices follow transparent, fair standards aligned with U.S. consumer-protection
            expectations and Illinois law where applicable.
          </p>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Collection</h2>
            <p>
              Reviews are collected only from individuals reporting a genuine experience with a dealership. We never
              purchase, pay for, or fabricate reviews.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Verification</h2>
            <p>
              Where possible, reviews are verified via proof of purchase or service and labelled{" "}
              <em>Verified Purchase</em> or <em>Verified Visit</em>. Unverified reviews are clearly labelled but not
              suppressed.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">No incentives, no bias</h2>
            <p>
              We do not offer incentives in exchange for positive reviews. Negative reviews are never edited, hidden, or
              down-ranked. Dealers may respond publicly but cannot alter a reviewer&apos;s text.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Moderation</h2>
            <p>
              Submissions are screened (automated and manual) for authenticity and policy compliance. Suspected fake or
              abusive content is routed to moderation. See our{" "}
              <a href="/methodology" className="text-gold-700 hover:underline">methodology</a>.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Disputes &amp; grievances</h2>
            <p>
              Disputes about reviews or listings can be raised through our{" "}
              <a href="/grievance" className="text-gold-700 hover:underline">support &amp; grievances</a> channel.
              Illinois users may also rely on applicable state consumer-protection remedies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
