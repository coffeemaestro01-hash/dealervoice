import { PhoneOff, Bot, TrendingUp } from "lucide-react";
import { PROBLEM_SOLUTION } from "@/lib/marketing/voice";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";
import { SectionHeader } from "@/components/luxury/SectionHeader";

const STEPS = [
  { key: "problem", data: PROBLEM_SOLUTION.problem, icon: PhoneOff, accent: "from-red-500/20 to-transparent" },
  { key: "solution", data: PROBLEM_SOLUTION.solution, icon: Bot, accent: "from-gold-500/25 to-transparent" },
  { key: "result", data: PROBLEM_SOLUTION.result, icon: TrendingUp, accent: "from-green-500/20 to-transparent" },
] as const;

export function ProblemSolutionSection() {
  return (
    <section className="relative py-24 md:py-32 bg-night-soft overflow-hidden">
      <LuxuryMesh className="opacity-60" />
      <div className="container relative">
        <SectionHeader
          eyebrow="The playbook"
          title={<>Dealers buy outcomes — <span className="text-gold italic">not AI</span></>}
          subtitle="Every missed call is revenue walking out the door. DealerVoice answers, qualifies, and books — while your team focuses on closing."
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <div key={step.key} className="luxury-card p-8 md:p-9 group hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} border border-white/10 flex items-center justify-center`}>
                  <step.icon size={22} className="text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-luxury text-gray-500 font-semibold">Step 0{i + 1}</span>
              </div>
              <h3 className="font-display text-2xl text-white font-semibold mb-5 leading-snug">{step.data.title}</h3>
              <ul className="space-y-4">
                {step.data.points.map((p) => (
                  <li key={p} className="text-sm text-gray-400 leading-relaxed flex gap-3">
                    <span className="text-gold-500 mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-gold-500" />
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
