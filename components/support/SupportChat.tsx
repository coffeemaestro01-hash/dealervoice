"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the DealerVoice assistant. Ask me about reviews, claiming a dealership, pricing, or your data. How can I help?",
};

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only real turns (skip the local greeting) to the API.
        body: JSON.stringify({ messages: next.filter((_, i) => i !== 0) }),
      });
      const data = await res.json();
      const reply =
        res.ok && data.reply
          ? data.reply
          : data.error ?? "Sorry, something went wrong. Please email support@dealervoice.io.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Please try again or email support@dealervoice.io." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          aria-label="Open support chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 grid place-items-center w-14 h-14 rounded-full bg-gold-gradient text-night-900 shadow-gold hover:opacity-90 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl bg-white border border-gold/20 shadow-gold overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 bg-night-gradient text-white">
            <div>
              <p className="font-semibold leading-tight">DealerVoice Support</p>
              <p className="text-xs text-white/60 leading-tight">AI assistant</p>
            </div>
            <button aria-label="Close support chat" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gold-gradient text-night-900 font-medium rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              maxLength={2000}
              className="flex-1 h-10 rounded-full border border-gray-200 px-4 text-sm focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid place-items-center w-10 h-10 rounded-full bg-gold-gradient text-night-900 disabled:opacity-40 hover:opacity-90 transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
