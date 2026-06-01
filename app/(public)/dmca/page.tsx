import type { Metadata } from "next";

export const metadata: Metadata = { title: "DMCA & Content Policy", description: "How to report copyright infringement or request content removal on DealerVoice." };

export default function DmcaPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">DMCA &amp; <span className="text-gold">Content Policy</span></h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: June 2026</p>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section><h2 className="text-xl font-bold text-gray-900">Reporting infringement</h2><p>If you believe content on DealerVoice infringes your copyright, send a notice to <a href="mailto:legal@dealervoice.com" className="text-gold-700 hover:underline">legal@dealervoice.com</a> including: identification of the work, the URL of the infringing content, your contact details, and a good-faith statement.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900">Removing a review</h2><p>We do not remove genuine reviews simply because a business disagrees with them. We will review content that is fraudulent, defamatory, contains private information, or violates our guidelines.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900">Counter-notice</h2><p>If your content was removed in error, you may submit a counter-notice to the same address and we will review it promptly.</p></section>
        </div>
      </div>
    </div>
  );
}
