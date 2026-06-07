import { PhoneOff, Bot, TrendingUp } from "lucide-react";
import { PROBLEM_SOLUTION } from "@/lib/marketing/voice";

const STEPS = [
  { key: "problem", data: PROBLEM_SOLUTION.problem, icon: PhoneOff, color: "text-red-400 bg-red-500/10" },
  { key: "solution", data: PROBLEM_SOLUTION.solution, icon: Bot, color: "text-gold-400 bg-gold-500/10" },
  { key: "result", data: PROBLEM_SOLUTION.result, icon: TrendingUp, color: "text-green-400 bg-green-500/10" },
] as const;

export function ProblemSolutionSection() {
  return (
    <section className="py-16 md:py-20 bg-night-soft border-y border-white/5">
      <div className="container">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Problem → Solution → <span className="text-gold">Result</span>
          </h2>
          <p className="text-gray-400 mt-3">
            Dealers don&apos;t buy AI. They buy booked appointments and recovered revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.key} className="relative card-dark rounded-2xl border border-white/10 p-6 md:p-8">
              {i < 2 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gold-500/40 text-2xl z-10">→</div>
              )}
              <div className={`inline-flex p-3 rounded-xl mb-4 ${step.color}`}>
                <step.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{step.data.title}</h3>
              <ul className="space-y-3">
                {step.data.points.map((p) => (
                  <li key={p} className="text-sm text-gray-400 flex gap-2 leading-relaxed">
                    <span className="text-gold-500 shrink-0">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
