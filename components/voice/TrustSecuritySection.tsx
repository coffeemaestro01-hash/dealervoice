import { Shield, Lock, Server, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Shield, title: "Enterprise security", desc: "SOC 2 aligned controls. Your customer data stays protected." },
  { icon: Lock, title: "Encrypted everywhere", desc: "TLS in transit, encrypted at rest. PCI-aware billing." },
  { icon: Server, title: "99.9% uptime SLA", desc: "Redundant telephony — never miss a revenue opportunity." },
  { icon: Headphones, title: "White-glove onboarding", desc: "DMS, CRM, and phone integration in 2–4 weeks." },
];

export function TrustSecuritySection() {
  return (
    <section className="py-16 md:py-20 bg-night border-t border-white/[0.06]">
      <div className="container">
        <p className="text-center text-[10px] uppercase tracking-luxury text-gray-500 font-semibold mb-10">
          Built for dealership trust
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-gold/25 transition-colors duration-300">
              <item.icon size={20} className="text-gold-400 mb-3" />
              <p className="text-white text-sm font-semibold mb-1">{item.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
