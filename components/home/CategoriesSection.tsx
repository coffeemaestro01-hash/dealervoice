import Link from "next/link";
import { Car, Truck, Zap, Gem, Wrench, Bike, Building2, BadgeCheck } from "lucide-react";

const CATEGORIES = [
  { label: "New Cars", icon: Car, href: "/dealers?category=NEW_VEHICLE" },
  { label: "Used Cars", icon: BadgeCheck, href: "/dealers?category=USED_VEHICLE" },
  { label: "Electric & Hybrid", icon: Zap, href: "/dealers?category=EV" },
  { label: "Luxury", icon: Gem, href: "/dealers?category=LUXURY" },
  { label: "Commercial", icon: Truck, href: "/dealers?category=COMMERCIAL" },
  { label: "Motorcycles", icon: Bike, href: "/dealers?category=MOTORCYCLE" },
  { label: "Service & Repair", icon: Wrench, href: "/dealers?q=service" },
  { label: "Multi-Brand", icon: Building2, href: "/dealers?category=MULTI_BRAND" },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-night">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Browse by category</h2>
          <p className="text-gray-400 mt-2">Find the right dealership for whatever you&apos;re looking for.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group flex flex-col items-center text-center gap-3 rounded-2xl border border-white/10 bg-night p-6 hover:border-gold/50 hover:shadow-lg hover:shadow-gold transition-all"
            >
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gold-500/10 text-gold-400 group-hover:bg-gold-gradient group-hover:text-night-900 transition-colors">
                <c.icon size={26} />
              </span>
              <span className="font-semibold text-gray-100 group-hover:text-gold-300">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
