import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy", description: "How DealerVoice uses cookies and similar technologies." };

export default function CookiesPage() {
  return (
    <div className="bg-white">
      <div className="container max-w-3xl py-14">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Cookie <span className="text-gold">Policy</span></h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: June 2026</p>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section><h2 className="text-xl font-bold text-gray-900">What are cookies?</h2><p>Cookies are small text files stored on your device that help websites work and remember your preferences.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900">How we use them</h2><p>We use <strong>essential cookies</strong> to keep you signed in and secure, and <strong>analytics cookies</strong> to understand how the site is used so we can improve it. We do not use cookies to sell your data.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900">Managing cookies</h2><p>You can control or delete cookies in your browser settings. Disabling essential cookies may affect core features like signing in.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900">Questions</h2><p>Email <a href="mailto:privacy@dealervoice.io" className="text-gold-700 hover:underline">privacy@dealervoice.io</a>.</p></section>
        </div>
      </div>
    </div>
  );
}
