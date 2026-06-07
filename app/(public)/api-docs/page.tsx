import type { Metadata } from "next";
import { Code2, Lock, Mail } from "lucide-react";

export const metadata: Metadata = { title: "API Access", description: "Programmatic access to DealerVoice ratings and reviews for partners." };

export default function ApiDocsPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-5">
            <Code2 size={14} /> Developers
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">DealerVoice <span className="text-gold">API</span></h1>
          <p className="text-lg text-gray-600">Embed verified ratings and reviews into your own apps and websites.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container max-w-2xl">
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-8">
            <div className="bg-night-800 text-gray-200 text-sm font-mono p-5 overflow-x-auto">
              <div className="text-gray-500"># Example: fetch a dealership&apos;s rating</div>
              <div><span className="text-gold-400">GET</span> https://api.dealervoice.io/v1/dealers/&#123;id&#125;</div>
              <div className="text-gray-500 mt-2"># Response</div>
              <div>&#123; &quot;name&quot;: &quot;...&quot;, &quot;rating&quot;: 4.6, &quot;reviews&quot;: 847 &#125;</div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 p-7 shadow-sm text-center">
            <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-50 text-gold-600 mx-auto mb-4"><Lock size={22} /></span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">API access is available on Enterprise plans</h2>
            <p className="text-gray-600 mb-5">Request an API key and full documentation from our team.</p>
            <a href="mailto:api@dealervoice.io" className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gold-gradient text-night-900 font-semibold hover:opacity-90">
              <Mail size={16} /> Request access
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
