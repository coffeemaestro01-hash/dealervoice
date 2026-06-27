"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  dealershipId: string;
  dealerName: string;
};

export function DealerVoiceSalesAssistant({ dealershipId, dealerName }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sid] = useState(() => {
    if (typeof window === "undefined") return "";
    const storageKey = `dv_sa_sid_${dealershipId}`;
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(storageKey, id);
    return id;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/sales-assistant/chat?dealershipId=${encodeURIComponent(dealershipId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled && data.greeting) {
          setEnabled(true);
          setMessages([{ role: "assistant", content: data.greeting }]);
        }
      })
      .catch(() => {});
  }, [dealershipId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading || !sid) return;
      const next = [...messages, { role: "user" as const, content: clean }];
      setMessages(next);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/sales-assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealershipId, sessionId: sid, messages: next }),
        });
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Thanks — our team will follow up shortly." }]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Sorry, I'm having trouble right now. Please use the quote form on this page." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [dealershipId, loading, messages, sid]
  );

  if (!enabled) return null;

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 text-sm font-semibold hover:opacity-95 transition-opacity"
          aria-label={`Chat with ${dealerName} assistant`}
        >
          <MessageCircle size={18} />
          Chat with us 24/7
        </button>
      ) : (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40 w-[min(100vw-2rem,380px)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 bg-primary text-primary-foreground px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot size={18} />
              {dealerName} Assistant
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 max-h-80 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
                  m.role === "user" ? "ml-auto bg-primary/10 text-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 size={14} className="animate-spin" /> Typing…
              </div>
            ) : null}
          </div>
          <form
            className="border-t border-border p-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ask about inventory, hours, visits…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-primary text-primary-foreground p-2 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
