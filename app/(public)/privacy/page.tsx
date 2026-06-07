import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DealerVoice collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy <span className="text-gold">Policy</span></h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900">1. Information we collect</h2>
            <p>We collect information you provide directly - such as your name, email address, and the content of reviews you write - as well as limited technical data (device, browser, and usage analytics) needed to operate the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">2. How we use your information</h2>
            <p>We use your information to publish and verify reviews, personalise your experience, prevent fraud and abuse, communicate with you about your account, and improve the platform. We never sell your personal data.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">3. Review verification</h2>
            <p>When you submit proof of purchase or service (e.g. an invoice) to earn a Verified badge, we use it solely to confirm authenticity. Verification documents are stored securely and are not shown publicly.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">4. Sharing</h2>
            <p>Your public profile name and review content are visible to others. We share data with service providers (hosting, email, analytics) only as needed to run DealerVoice, and with authorities where legally required.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">5. Your rights</h2>
            <p>You may access, correct, export, or delete your personal data at any time from your account settings, or by contacting <a href="mailto:privacy@dealervoice.io" className="text-gold-700 hover:underline">privacy@dealervoice.io</a>. Depending on your region, you may have additional rights under GDPR, CCPA, or local law.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">6. Data security</h2>
            <p>We use encryption in transit, access controls, and regular security reviews to protect your information. No system is perfectly secure, but we work hard to safeguard your data.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900">7. Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:privacy@dealervoice.io" className="text-gold-700 hover:underline">privacy@dealervoice.io</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
