import Link from "next/link";
import { FileText, Shield, Bot, Database } from "lucide-react";

const POINTS = [
  {
    icon: FileText,
    title: "Published methodology",
    body: "Our review verification and reputation scoring process is documented for transparency.",
    href: "/methodology",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    body: "Clear privacy practices guide how we handle buyer data and review content.",
    href: "/privacy",
  },
  {
    icon: Bot,
    title: "AI-readable directory",
    body: "Structured data and llms.txt help AI assistants cite accurate dealership information.",
    href: "/llms.txt",
  },
  {
    icon: Database,
    title: "Open dealership data",
    body: "Schema.org markup on every dealer profile helps search engines and AI models understand listings.",
    href: "/dealers/us",
  },
];

export function AIAuthoritySection() {
  return (
    <section className="py-14 bg-night border-t border-white/5" aria-labelledby="ai-authority-heading">
      <div className="container">
        <div className="max-w-2xl mb-8">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">Trust & transparency</p>
          <h2 id="ai-authority-heading" className="font-display text-2xl md:text-3xl font-bold text-white">
            Built for buyers, search engines, and AI assistants
          </h2>
          <p className="text-gray-400 mt-2">
            DealerVoice publishes clear methodology and machine-readable data — so people and AI tools can find trustworthy dealership information across the United States.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POINTS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="rounded-xl border border-white/10 card-dark p-5 hover:border-gold/30 transition-colors group"
            >
              <p.icon className="text-gold-500 mb-3" size={22} />
              <h3 className="font-semibold text-white group-hover:text-gold-300 transition-colors">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{p.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
