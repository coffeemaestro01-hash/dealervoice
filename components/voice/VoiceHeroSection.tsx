"use client";

import { motion } from "framer-motion";
import { Sparkles, Play, Calculator, ArrowRight, PhoneCall } from "lucide-react";
import { VOICE_HERO } from "@/lib/marketing/voice";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

const MARQUEE = [
  "AI Voice for Dealerships",
  "24/7 Appointment Booking",
  "DMS & CRM Integrated",
  "Revenue Recovery",
  "Service · Sales · BDC",
  "Built for Automotive",
];

export function VoiceHeroSection() {
  return (
    <section className="relative min-h-[92vh] flex flex-col bg-night overflow-hidden">
      <LuxuryMesh />

      <div className="container relative flex-1 flex flex-col justify-center py-20 md:py-28 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="luxury-pill mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#22c55e] animate-glow-pulse" />
              <Sparkles size={13} className="text-gold-400" />
              {VOICE_HERO.badge}
            </div>

            <h1 className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-semibold text-white leading-[1.05] tracking-tight mb-6">
              Turn missed calls into{" "}
              <span className="text-gold italic">booked</span>{" "}
              appointments.
            </h1>

            <p className="text-lg md:text-xl text-gray-400/95 max-w-xl leading-relaxed mb-10 font-light">
              {VOICE_HERO.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10">
              <LuxuryButton href="/demo" variant="primary" icon={<ArrowRight size={16} />}>
                Book a Private Demo
              </LuxuryButton>
              <LuxuryButton href="#call-samples" variant="outline" icon={<Play size={15} />}>
                Hear a Live Call
              </LuxuryButton>
              <LuxuryButton href="#roi-calculator" variant="ghost" icon={<Calculator size={15} />}>
                Calculate ROI
              </LuxuryButton>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-500 tracking-wide">
              {["No long-term contract", "Live in 2–4 weeks", "Enterprise-grade security"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="luxury-card p-6 md:p-8 animate-float">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-gold-400/90 font-semibold">Command Center</p>
                  <p className="text-white font-medium mt-1">Today&apos;s performance</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-glow-pulse" />
                  <span className="text-green-400 text-xs font-medium">AI Active</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Calls answered", value: "47", accent: false },
                  { label: "Appointments booked", value: "12", accent: false },
                  { label: "Revenue recovered", value: "$4,200", accent: true },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 ${
                      row.accent
                        ? "bg-gold-500/10 border border-gold/30"
                        : "bg-white/[0.04] border border-white/[0.08]"
                    }`}
                  >
                    <span className="text-gray-400 text-sm">{row.label}</span>
                    <span className={`luxury-stat text-2xl font-semibold ${row.accent ? "text-gold" : "text-white"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-black/30 border border-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/15 border border-gold/30 flex items-center justify-center">
                    <PhoneCall size={18} className="text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">Oil change · Thu 9:30 AM</p>
                    <p className="text-gray-500 text-xs">2021 Ford Explorer · RO $189</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-green-400 font-semibold shrink-0">Booked</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative border-t border-white/[0.06] bg-black/40 overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="text-xs uppercase tracking-luxury text-gray-500 font-medium flex items-center gap-12">
              {item}
              <span className="text-gold-500/60">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
