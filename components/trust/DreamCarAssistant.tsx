"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Car, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export interface DealerContext {
  name: string;
  city: string | null;
  rating: number;
  slug: string;
}

interface Props {
  dealerContext?: DealerContext;
}

const GENERIC_GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the Dream Car Assistant. Tell me what you're looking for — brand, city, budget, new or used — and I'll help you find the right dealer. What's your dream car?",
};

function dealerGreeting(ctx: DealerContext): Msg {
  const ratingText = ctx.rating > 0 ? ` with a ${ctx.rating.toFixed(1)}★ rating` : "";
  return {
    role: "assistant",
    content: `Hi! You're browsing **${ctx.name}**${ctx.city ? ` in ${ctx.city}` : ""}${ratingText}. I can answer questions about this dealership, compare alternatives, or help you decide if it's the right fit. What would you like to know?`,
  };
}

const QUICK_PROMPTS = [
  "Find a Toyota dealer in Delhi",
  "Best luxury car dealers near me",
  "Which dealers have good after-sales?",
  "Compare SUV dealers in Mumbai",
];

export function DreamCarAssistant({ dealerContext }: Props = {}) {
  const greeting = dealerContext ? dealerGreeting(dealerContext) : GENERIC_GREETING;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading) return;
      const next: Msg[] = [...messages, { role: "user", content: clean }];
      setMessages(next);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/trust/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((_, i) => i !== 0),
            dealerContext: dealerContext ?? null,
          }),
        });
        const data = await res.json();
        const reply =
          res.ok && data.reply
            ? data.reply
            : data.error ?? "Sorry, I couldn't process that. Please try again.";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Network error. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  return (
    <>
      {/* Launcher button */}
      {!open && (
        <button
          aria-label="Open Dream Car Assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-night-700 text-white border border-gold-500/30 shadow-lg hover:border-gold-400/60 hover:bg-night-600 transition-all text-sm font-medium"
        >
          <Car size={16} className="text-gold-400" />
          <span>Dream Car Assistant</span>
          <Sparkles size={12} className="text-gold-400" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-[92vw] max-w-sm h-[72vh] max-h-[580px] flex flex-col rounded-2xl bg-white border border-gold-200/60 shadow-xl overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-night-800 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/30 grid place-items-center">
                <Car size={15} className="text-gold-400" />
              </div>
              <div>
                <p className="font-semibold leading-tight text-sm">Dream Car Assistant</p>
                <p className="text-[11px] text-white/50 leading-tight">
                  AI-powered · no paid placements
                </p>
              </div>
            </div>
            <button
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-gold-500 text-white font-medium rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.role === "assistant" && i === 0 && (
                    <Sparkles size={12} className="inline text-gold-500 mr-1 mb-0.5" />
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 text-gray-400 text-xs flex items-center gap-2 shadow-sm">
                  <Loader2 size={13} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && !loading && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="shrink-0 text-xs bg-gray-100 hover:bg-gold-50 hover:text-gold-700 text-gray-600 rounded-full px-3 py-1.5 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Hyundai dealer in Bangalore with good service..."
              maxLength={500}
              className="flex-1 h-10 rounded-full border border-gray-200 px-4 text-sm focus:outline-none focus:border-gold-400/60 bg-gray-50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid place-items-center w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-600 text-white disabled:opacity-40 transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
