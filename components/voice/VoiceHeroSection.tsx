"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Play, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VOICE_HERO } from "@/lib/marketing/voice";

export function VoiceHeroSection() {
  return (
    <section className="relative bg-night overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(251,101,20,0.14),transparent_60%)]" />
      <div className="absolute top-20 -right-24 w-[28rem] h-[28rem] bg-gold-500/12 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative py-14 md:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-400 font-medium mb-6">
              <Phone size={14} />
              {VOICE_HERO.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              {VOICE_HERO.headline}
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
              {VOICE_HERO.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gold-gradient text-night-900 hover:opacity-90 font-semibold border-0 shadow-gold gap-2">
                  Book a Demo
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <a href="#call-samples">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 border-gold/50 text-gold-300 bg-transparent hover:bg-gold-500/15 gap-2">
                  <Play size={16} />
                  Listen to a Real Call
                </Button>
              </a>
              <a href="#roi-calculator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 border-white/20 text-gray-200 bg-transparent hover:bg-white/5 gap-2">
                  <Calculator size={16} />
                  Calculate ROI
                </Button>
              </a>
            </div>

            <p className="text-gray-500 text-sm">
              No long-term contract · Go live in 2–4 weeks · Integrates with your DMS &amp; CRM
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card-dark rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/40"
          >
            <p className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-4">Live dashboard preview</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <span className="text-gray-400 text-sm">Calls answered today</span>
                <span className="text-2xl font-bold text-white">47</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                <span className="text-gray-400 text-sm">Appointments booked</span>
                <span className="text-2xl font-bold text-green-400">12</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gold-500/10 border border-gold/30 px-4 py-3">
                <span className="text-gold-300 text-sm font-medium">Revenue recovered (est.)</span>
                <span className="text-2xl font-bold text-gold-400">$4,200</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-gray-500 mb-2">Latest booked appointment</p>
                <p className="text-white text-sm font-medium">Oil change + inspection · Thu 9:30 AM</p>
                <p className="text-gray-500 text-xs mt-1">2021 Ford Explorer · RO est. $189</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
