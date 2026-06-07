"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { ROI_DEFAULTS } from "@/lib/marketing/voice";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function RoiCalculator() {
  const [monthlyCalls, setMonthlyCalls] = useState(ROI_DEFAULTS.monthlyCalls);
  const [missedRate, setMissedRate] = useState(ROI_DEFAULTS.missedRate);
  const [avgRepairOrder, setAvgRepairOrder] = useState(ROI_DEFAULTS.avgRepairOrder);
  const [conversionRate, setConversionRate] = useState(ROI_DEFAULTS.conversionRate);

  const result = useMemo(() => {
    const missed = monthlyCalls * (missedRate / 100);
    const recovered = missed * (conversionRate / 100);
    const monthly = recovered * avgRepairOrder;
    return { missed: Math.round(missed), recovered: Math.round(recovered), monthly };
  }, [monthlyCalls, missedRate, avgRepairOrder, conversionRate]);

  return (
    <section id="roi-calculator" className="relative py-24 md:py-32 bg-night scroll-mt-24 overflow-hidden">
      <LuxuryMesh />
      <div className="container relative">
        <SectionHeader
          eyebrow="ROI Calculator"
          title={<>How much revenue are you <span className="text-gold italic">leaving behind?</span></>}
          subtitle="Plug in your store's numbers. See the opportunity in seconds."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="luxury-card p-8 space-y-6">
            {[
              { label: "Monthly service calls", value: monthlyCalls, set: setMonthlyCalls, max: undefined },
              { label: "Missed call rate (%)", value: missedRate, set: setMissedRate, max: 100 },
              { label: "Average repair order ($)", value: avgRepairOrder, set: setAvgRepairOrder, max: undefined },
              { label: "Recovery conversion (%)", value: conversionRate, set: setConversionRate, max: 100 },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs uppercase tracking-luxury text-gray-500 font-semibold">{field.label}</label>
                <input
                  type="number"
                  min={0}
                  max={field.max}
                  value={field.value}
                  onChange={(e) => field.set(Number(e.target.value) || 0)}
                  className="mt-2 w-full h-12 rounded-xl bg-black/30 border border-white/10 px-4 text-white luxury-stat text-lg focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="luxury-card p-8 md:p-10 flex flex-col justify-between bg-gradient-to-br from-gold-500/[0.08] to-transparent">
            <div>
              <p className="text-xs uppercase tracking-luxury text-gold-400 font-semibold mb-8">Your opportunity</p>
              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm">Missed calls / month</span>
                  <span className="luxury-stat text-3xl text-white font-semibold">{result.missed}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-gray-400 text-sm">Recoverable appointments</span>
                  <span className="luxury-stat text-3xl text-white font-semibold">{result.recovered}</span>
                </div>
              </div>
              <p className="text-xs uppercase tracking-luxury text-gold-300/80 mb-2">Potential revenue recovered</p>
              <p className="font-display text-5xl md:text-6xl font-semibold text-gold luxury-stat">{formatMoney(result.monthly)}</p>
              <p className="text-gray-500 text-sm mt-2">per month</p>
            </div>
            <Link
              href="/demo"
              className="mt-10 inline-flex items-center justify-center h-12 rounded-full btn-luxury-primary text-night-900 font-semibold text-sm tracking-wide"
            >
              Book a Demo — See It Live
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
