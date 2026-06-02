import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Car buying tips, dealership insights, and DealerVoice product news.",
};

const POSTS = [
  { slug: "#", title: "How to spot a trustworthy car dealership", excerpt: "Five signals that separate great dealers from the rest - and how verified reviews reveal them.", date: "May 28, 2026", tag: "Buyer Guide" },
  { slug: "#", title: "Why verified reviews matter more than star ratings", excerpt: "A high rating means little without proof. Here's how verification changes the game for buyers.", date: "May 14, 2026", tag: "Trust & Safety" },
  { slug: "#", title: "Dealers: turning reviews into your best marketing channel", excerpt: "Responding to reviews isn't damage control - it's the highest-ROI trust builder you have.", date: "Apr 30, 2026", tag: "For Dealers" },
  { slug: "#", title: "What makes a dealership reputation score fair", excerpt: "A look at the factors that should - and shouldn't - shape how a dealership is rated online.", date: "Apr 12, 2026", tag: "Research" },
];

export default function BlogPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">The <span className="text-gold">DealerVoice</span> blog</h1>
          <p className="text-lg text-gray-600">Car-buying tips, dealership insights, and product updates.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid md:grid-cols-2 gap-6 max-w-4xl">
          {POSTS.map((p) => (
            <Link key={p.title} href={p.slug} className="group rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:border-gold/40 transition-all">
              <span className="inline-block text-xs font-semibold text-gold-700 bg-gold-50 rounded-full px-3 py-1 mb-4">{p.tag}</span>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-gold-700 transition-colors mb-2">{p.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {p.date}</span>
                <span className="inline-flex items-center gap-1 text-gold-700 font-medium">Read <ArrowRight size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="container max-w-4xl mt-10">
          <div className="rounded-2xl bg-night-gradient text-white p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Get our newsletter</h3>
            <p className="text-gray-300 text-sm mb-5">Monthly insights on car buying and dealership trends. No spam.</p>
            <form action="mailto:hello@dealervoice.com" method="post" encType="text/plain" className="flex gap-2 max-w-md mx-auto">
              <input name="email" type="email" required placeholder="you@email.com" className="flex-1 h-11 rounded-lg px-3 text-gray-900 focus:outline-none" />
              <button className="h-11 px-5 rounded-lg bg-gold-gradient text-night-900 font-semibold">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
