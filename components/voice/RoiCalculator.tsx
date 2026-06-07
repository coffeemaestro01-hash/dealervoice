"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROI_DEFAULTS } from "@/lib/marketing/voice";

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
    <section id="roi-calculator" className="py-16 md:py-20 bg-night scroll-mt-20">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-medium mb-3">
            <Calculator size={16} />
            ROI Calculator
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            How much revenue are you <span className="text-gold">leaving on the table</span>?
          </h2>
          <p className="text-gray-400 mt-2 max-w-lg mx-auto">
            Dealers love numbers. Plug in your store&apos;s metrics and see estimated recovered revenue.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="card-dark rounded-2xl border border-white/10 p-6 md:p-8 space-y-5">
            <div>
              <Label className="text-gray-300">Monthly service calls received</Label>
              <Input
                type="number"
                min={0}
                value={monthlyCalls}
                onChange={(e) => setMonthlyCalls(Number(e.target.value) || 0)}
                className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
              />
            </div>
            <div>
              <Label className="text-gray-300">Missed call rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={missedRate}
                onChange={(e) => setMissedRate(Number(e.target.value) || 0)}
                className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
              />
            </div>
            <div>
              <Label className="text-gray-300">Average repair order ($)</Label>
              <Input
                type="number"
                min={0}
                value={avgRepairOrder}
                onChange={(e) => setAvgRepairOrder(Number(e.target.value) || 0)}
                className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
              />
            </div>
            <div>
              <Label className="text-gray-300">Recovery conversion rate (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value) || 0)}
                className="mt-1.5 bg-white/5 border-white/10 text-white h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Industry avg: 30–40% of missed calls convert when answered</p>
            </div>
          </div>

          <div className="card-dark rounded-2xl border border-gold/30 bg-gold-500/5 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-6">Your estimated opportunity</p>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Missed calls / month</span>
                  <span className="text-white font-semibold">{result.missed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Recoverable appointments</span>
                  <span className="text-white font-semibold">{result.recovered}</span>
                </div>
              </div>
              <p className="text-sm text-gold-300 font-medium uppercase tracking-wide">Potential revenue recovered</p>
              <p className="text-4xl md:text-5xl font-extrabold text-gold-400 mt-2">{formatMoney(result.monthly)}</p>
              <p className="text-gray-500 text-sm mt-2">per month</p>
            </div>
            <Link href="/demo" className="mt-8">
              <Button size="lg" className="w-full bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90 h-12">
                Book a Demo — See It Live
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
