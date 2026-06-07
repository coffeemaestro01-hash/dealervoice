import { INTEGRATIONS } from "@/lib/marketing/voice";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import { cn } from "@/lib/utils";

export function IntegrationsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-night-soft border-y border-white/[0.06]">
      <div className="container">
        <SectionHeader
          eyebrow="Integrations"
          title={<>Plugs into your <span className="text-gold italic">existing stack</span></>}
          subtitle="The first question every dealer asks: Does it work with my CRM and DMS? Yes — or we're building it now."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              className="luxury-card p-5 text-center hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 mx-auto mb-3 flex items-center justify-center font-display text-xl text-gold font-semibold">
                {int.name.charAt(0)}
              </div>
              <p className="text-white text-sm font-medium leading-tight">{int.name}</p>
              <p className="text-gray-600 text-[10px] uppercase tracking-wider mt-1">{int.category}</p>
              <span className={cn(
                "inline-block mt-3 text-[9px] font-bold uppercase tracking-luxury px-2.5 py-1 rounded-full",
                int.status === "available" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"
              )}>
                {int.status === "available" ? "Live" : "Soon"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-12">
          Don&apos;t see your system?{" "}
          <a href="/demo" className="text-gold-400 hover:text-gold-300 underline underline-offset-4 decoration-gold/40">
            Request an integration
          </a>
        </p>
      </div>
    </section>
  );
}
