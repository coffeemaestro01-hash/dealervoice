import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BIS IS 19000:2022 Compliance",
  description: "DealerVoice's self-declaration of conformance with the BIS standard for online consumer reviews.",
};

export default function BisCompliancePage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">BIS <span className="text-gold">IS 19000:2022</span> compliance</h1>
        <p className="text-sm text-gray-500 mb-10">Self-declaration · Online Consumer Reviews</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            DealerVoice aligns its review practices with the Bureau of Indian Standards <strong>IS 19000:2022</strong> guidelines
            for the collection, moderation, and publication of online consumer reviews. This page is our voluntary self-declaration.
          </p>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Collection</h2>
            <p>Reviews are collected only from individuals reporting a genuine experience with a dealership. We never purchase, solicit-for-payment, or fabricate reviews.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Verification</h2>
            <p>Where possible, reviews are verified via proof of purchase or service and labelled <em>Verified Purchase</em> / <em>Verified Visit</em>. Unverified reviews are clearly labelled but never suppressed.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">No incentives, no bias</h2>
            <p>We do not offer incentives in exchange for positive reviews. Negative reviews are never edited, hidden, or down-ranked, and dealers cannot alter a reviewer&apos;s text — only respond to it.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Moderation &amp; fake-review detection</h2>
            <p>Submissions are screened (automated + manual) for authenticity. Suspected fake or policy-violating reviews are routed to moderation rather than auto-deleted. See our <a href="/methodology" className="text-gold-700 hover:underline">methodology</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">Complaints</h2>
            <p>Disputes about any review can be raised through our <a href="/grievance" className="text-gold-700 hover:underline">grievance channel</a>.</p>
          </section>
          <p className="text-sm text-gray-500 pt-2">
            No formal BIS certification body currently certifies this standard; this declaration reflects our good-faith conformance and is reviewed periodically.
          </p>
        </div>
      </div>
    </div>
  );
}
