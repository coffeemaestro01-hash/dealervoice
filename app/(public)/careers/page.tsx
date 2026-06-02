import type { Metadata } from "next";
import { Heart, Globe, Rocket, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Careers", description: "Join the DealerVoice team and help make car buying trustworthy for everyone." };

const PERKS = [
  { icon: Globe, title: "Remote-first", body: "Work from anywhere. We're a distributed team across time zones." },
  { icon: Rocket, title: "Real ownership", body: "Shape the product and culture from the ground up." },
  { icon: Heart, title: "Mission-driven", body: "Build something that genuinely helps millions of car buyers." },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Build the future of <span className="text-gold">trust</span></h1>
          <p className="text-lg text-gray-600">We&apos;re a small, ambitious team on a mission to make car buying transparent. Come build with us.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {PERKS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-50 text-gold-600 mx-auto mb-4"><p.icon size={22} /></span>
                <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="max-w-xl mx-auto text-center rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No open roles right now</h2>
            <p className="text-gray-600 mb-5">But we&apos;re always glad to meet talented people. Tell us how you&apos;d like to contribute.</p>
            <a href="mailto:careers@dealervoice.com" className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gold-gradient text-night-900 font-semibold hover:opacity-90">
              <Mail size={16} /> careers@dealervoice.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
