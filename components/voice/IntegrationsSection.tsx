import { Plug } from "lucide-react";
import { INTEGRATIONS } from "@/lib/marketing/voice";
import { cn } from "@/lib/utils";

export function IntegrationsSection() {
  return (
    <section className="py-16 md:py-20 bg-night-soft border-y border-white/5">
      <div className="container">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-3">
            <Plug size={16} />
            Integrations
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Works with your <span className="text-gold">existing systems</span>
          </h2>
          <p className="text-gray-400 mt-2">
            Dealers ask one question first: &ldquo;Does it work with my CRM and DMS?&rdquo; Yes — or we&apos;re building it.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              className="card-dark rounded-xl border border-white/10 p-4 text-center hover:border-gold/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 mx-auto mb-3 flex items-center justify-center text-gold-400 font-bold text-sm">
                {int.name.charAt(0)}
              </div>
              <p className="text-white text-sm font-semibold leading-tight">{int.name}</p>
              <p className="text-gray-500 text-xs mt-1">{int.category}</p>
              <span className={cn(
                "inline-block mt-2 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full",
                int.status === "available"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-amber-500/15 text-amber-400"
              )}>
                {int.status === "available" ? "Available" : "Coming soon"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Don&apos;t see your system? <a href="/demo" className="text-gold-400 hover:underline">Book a demo</a> — we add integrations based on dealer demand.
        </p>
      </div>
    </section>
  );
}
