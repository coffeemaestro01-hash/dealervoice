"use client";

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return n.toLocaleString();
}

export function TrustScoreVisual({ score = 87 }: { score?: number }) {
  const circumference = 283;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" aria-hidden />
      <svg width="160" height="160" viewBox="0 0 100 100" className="relative -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(0.99 0.005 85 / 0.08)" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.88 0.14 58)" />
            <stop offset="100%" stopColor="oklch(0.7 0.17 52)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-display font-semibold text-white tabular-nums">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-0.5">Trust score</span>
      </div>
    </div>
  );
}

export function ProductShowcaseCard({ dealerCount }: { dealerCount: number }) {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 animate-float">
      <div className="glass-panel glow-ring rounded-2xl p-6 md:p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/90">Live platform</p>
            <p className="text-white font-display text-lg font-medium mt-1">DealerVoice</p>
            <p className="text-white/45 text-xs mt-0.5">{compact(dealerCount)} rooftops indexed</p>
          </div>
          <TrustScoreVisual score={87} />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-white/70">AI Sales Assistant · active</span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              &quot;Hi! Ask about our inventory or book a visit — I&apos;m here 24/7.&quot;
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Reviews", value: "Verified" },
              { label: "Response", value: "94%" },
              { label: "Leads", value: "Captured" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] py-2.5 px-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wide">{item.label}</p>
                <p className="text-xs font-semibold text-white/90 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
