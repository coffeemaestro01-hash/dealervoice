"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  defaultPrice?: number; // in minor units (paise / cents)
  currency?: string;
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

export function FinanceCalculator({ defaultPrice = 0, currency = "USD" }: Props) {
  const defaultPriceMajor = Math.round(defaultPrice / 100);

  const [principal, setPrincipal] = useState(defaultPriceMajor || "");
  const [downPayment, setDownPayment] = useState("");
  const [rateType, setRateType] = useState<"flat" | "reducing">("reducing");
  const [annualRate, setAnnualRate] = useState("9");
  const [tenureMonths, setTenureMonths] = useState("60");
  const [emi, setEmi] = useState<number | null>(null);

  function calculate() {
    const P = Number(principal) - Number(downPayment || 0);
    const r = Number(annualRate) / 100;
    const n = Number(tenureMonths);

    if (P <= 0 || r <= 0 || n <= 0) return;

    let monthlyEmi: number;
    if (rateType === "flat") {
      // Flat rate: total interest = P * r * (n/12), spread equally
      const totalInterest = P * r * (n / 12);
      monthlyEmi = (P + totalInterest) / n;
    } else {
      // Reducing balance (standard EMI formula)
      const monthlyRate = r / 12;
      monthlyEmi = (P * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    setEmi(Math.round(monthlyEmi));
  }

  const totalPayable = emi ? emi * Number(tenureMonths) + Number(downPayment || 0) : 0;
  const totalInterest = emi ? totalPayable - Number(principal) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <Calculator size={17} className="text-primary" />
        EMI Calculator
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="calc-price" className="text-xs">Vehicle Price ({currency})</Label>
            <Input
              id="calc-price"
              type="number"
              className="mt-1 h-9 text-sm"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g. 1500000"
            />
          </div>
          <div>
            <Label htmlFor="calc-down" className="text-xs">Down Payment ({currency})</Label>
            <Input
              id="calc-down"
              type="number"
              className="mt-1 h-9 text-sm"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="e.g. 300000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="calc-rate" className="text-xs">Annual Rate (%)</Label>
            <Input
              id="calc-rate"
              type="number"
              step="0.1"
              className="mt-1 h-9 text-sm"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="calc-tenure" className="text-xs">Tenure (months)</Label>
            <Input
              id="calc-tenure"
              type="number"
              className="mt-1 h-9 text-sm"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Rate Type</Label>
          <div className="flex gap-2 mt-1">
            {(["reducing", "flat"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRateType(t)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  rateType === t
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border"
                )}
              >
                {t === "reducing" ? "Reducing Balance" : "Flat Rate"}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={calculate}
          className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
        >
          Calculate EMI
        </Button>

        {emi !== null && (
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/30 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">Monthly EMI</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(emi, currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Payable</span>
              <span>{formatCurrency(totalPayable, currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Interest</span>
              <span>{formatCurrency(totalInterest, currency)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">
              Indicative only. Final terms subject to lender approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
