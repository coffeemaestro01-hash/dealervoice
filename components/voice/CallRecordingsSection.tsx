"use client";

import { useState, useCallback } from "react";
import { Play, Pause, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CALL_SAMPLES } from "@/lib/marketing/voice";
import { cn } from "@/lib/utils";

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
      utter.pitch = line.speaker === "DealerVoice" ? 1 : 1.05;
      utter.onend = () => { i++; setTimeout(speakNext, 400); };
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  }, [sample, stop]);

  return (
    <section id="call-samples" className="py-16 md:py-20 bg-night-soft border-y border-white/5 scroll-mt-20">
      <div className="container">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Hear a <span className="text-gold">real conversation</span>
          </h2>
          <p className="text-gray-400 mt-2">
            Skeptical AI sounds robotic? Listen to how DealerVoice books appointments naturally.
            <span className="block text-xs text-gray-500 mt-1">Demo playback uses your browser voice engine · production uses human-quality AI voice</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CALL_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => { stop(); setActiveId(s.id); }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                activeId === s.id
                  ? "bg-gold-500/20 border-gold/50 text-gold-300"
                  : "border-white/10 text-gray-400 hover:border-white/20"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          <div className="lg:col-span-2 card-dark rounded-2xl border border-white/10 p-6">
            <p className="text-white font-semibold mb-1">{sample.title}</p>
            <p className="text-gray-500 text-sm mb-4">{sample.duration} · Demo call</p>
            <Button
              onClick={playing ? stop : play}
              className="w-full bg-gold-gradient text-night-900 font-semibold border-0 gap-2 mb-4"
            >
              {playing ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play Sample Call</>}
            </Button>
            <div className="flex items-start gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{sample.outcome}</span>
            </div>
          </div>

          <div className="lg:col-span-3 card-dark rounded-2xl border border-white/10 p-6 max-h-[22rem] overflow-y-auto">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Transcript</p>
            <div className="space-y-3">
              {sample.transcript.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    lineIndex === i ? "bg-gold-500/15 border border-gold/30" : "bg-white/5"
                  )}
                >
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    line.speaker === "DealerVoice" ? "text-gold-400" : "text-gray-400"
                  )}>
                    {line.speaker}
                  </span>
                  <p className="text-gray-200 mt-0.5">{line.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
