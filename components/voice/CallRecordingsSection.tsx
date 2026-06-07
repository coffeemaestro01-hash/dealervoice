"use client";

import { useState, useCallback } from "react";
import { Play, Pause, CheckCircle2 } from "lucide-react";
import { CALL_SAMPLES } from "@/lib/marketing/voice";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/luxury/SectionHeader";
import { LuxuryMesh } from "@/components/luxury/LuxuryMesh";

export function CallRecordingsSection() {
  const [activeId, setActiveId] = useState(CALL_SAMPLES[0].id);
  const [playing, setPlaying] = useState(false);
  const [lineIndex, setLineIndex] = useState(-1);

  const sample = CALL_SAMPLES.find((s) => s.id === activeId) ?? CALL_SAMPLES[0];

  const stop = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPlaying(false);
    setLineIndex(-1);
  }, []);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stop();
    setPlaying(true);
    let i = 0;
    const speakNext = () => {
      if (i >= sample.transcript.length) {
        setPlaying(false);
        setLineIndex(-1);
        return;
      }
      setLineIndex(i);
      const line = sample.transcript[i];
      const utter = new SpeechSynthesisUtterance(line.text);
      utter.rate = line.speaker === "DealerVoice" ? 1.05 : 0.95;
      utter.onend = () => { i++; setTimeout(speakNext, 450); };
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  }, [sample, stop]);

  return (
    <section id="call-samples" className="relative py-24 md:py-32 bg-night-soft border-y border-white/[0.06] scroll-mt-24 overflow-hidden">
      <LuxuryMesh className="opacity-50" />
      <div className="container relative">
        <SectionHeader
          eyebrow="Live proof"
          title={<>Hear the <span className="text-gold italic">conversation</span></>}
          subtitle="Skeptical AI sounds robotic? Listen to how DealerVoice books appointments — naturally, professionally, instantly."
        />

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CALL_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => { stop(); setActiveId(s.id); }}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                activeId === s.id
                  ? "bg-gold-500/15 border-gold/50 text-gold-300 shadow-gold"
                  : "border-white/10 text-gray-500 hover:border-gold/30 hover:text-gray-300"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          <div className="lg:col-span-2 luxury-card p-7">
            <p className="font-display text-xl text-white font-semibold mb-1">{sample.title}</p>
            <p className="text-gray-500 text-sm mb-6">{sample.duration} · Demonstration</p>
            <button
              onClick={playing ? stop : play}
              className="w-full h-12 rounded-full flex items-center justify-center gap-2 btn-luxury-primary text-night-900 font-semibold text-sm mb-5"
            >
              {playing ? <><Pause size={16} /> Stop playback</> : <><Play size={16} /> Play sample call</>}
            </button>
            <div className="flex items-start gap-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{sample.outcome}</span>
            </div>
          </div>

          <div className="lg:col-span-3 luxury-card p-6 max-h-[26rem] overflow-y-auto">
            <p className="text-[10px] uppercase tracking-luxury text-gray-500 mb-4 font-semibold">Transcript</p>
            <div className="space-y-3">
              {sample.transcript.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm transition-all duration-300",
                    lineIndex === i ? "bg-gold-500/15 border border-gold/30 shadow-gold" : "bg-white/[0.03] border border-transparent"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-luxury",
                    line.speaker === "DealerVoice" ? "text-gold-400" : "text-gray-500"
                  )}>
                    {line.speaker}
                  </span>
                  <p className="text-gray-200 mt-1 leading-relaxed">{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
