import { Shield, Lock, Server, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Shield, title: "SOC 2 aligned practices", desc: "Enterprise-grade security controls for dealership customer data." },
  { icon: Lock, title: "Encrypted calls & data", desc: "TLS in transit, encrypted storage at rest. PCI-aware billing via Razorpay." },
  { icon: Server, title: "99.9% uptime SLA", desc: "Redundant telephony routing so you never miss a revenue opportunity." },
  { icon: Headphones, title: "Dedicated onboarding", desc: "White-glove setup with your DMS, CRM, and phone system in 2–4 weeks." },
];

export function TrustSecuritySection() {
  return (
    <section className="py-14 bg-night border-t border-white/5">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white">Built for dealership trust</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <item.icon size={20} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
