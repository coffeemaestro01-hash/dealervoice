"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { INBOX_BASE_PATH } from "@/lib/inbox/constants";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your DealerVoice Inbox setup assistant. I'll help you connect your dealership email so customer messages flow into your inbox. Which email system do you use today — Gmail, Microsoft 365, or something else?",
};

export default function OnboardingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetch("/api/inbox/onboarding")
      .then((r) => r.json())
      .then(async (payload) => {
        if (payload.data?.id) {
          setSessionId(payload.data.id);
          const transcript = Array.isArray(payload.data.transcript) ? payload.data.transcript : [];
          if (transcript.length > 0) {
            setMessages(transcript as ChatMessage[]);
          }
          if (payload.data.completedAt) setComplete(true);
          return;
        }
        const created = await fetch("/api/inbox/onboarding", { method: "POST" });
        const createdPayload = await created.json();
        if (createdPayload.data?.id) setSessionId(createdPayload.data.id);
      })
      .finally(() => setBootstrapping(false));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading || !sessionId) return;

      const next = [...messages, { role: "user" as const, content: clean }];
      setMessages(next);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/inbox/onboarding/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean, sessionId }),
        });
        const payload = await res.json();
        const data = payload.data;

        const reply =
          res.ok && data?.reply
            ? data.reply
            : payload.error ?? "Something went wrong. Please try again.";

        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (data?.markComplete) setComplete(true);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Network error. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, sessionId]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (bootstrapping) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Starting setup assistant…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="text-primary" size={22} />
          Onboarding
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-guided setup to connect your dealership email inbox.
        </p>
      </div>

      {complete && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-foreground">Setup complete! Head to Settings to verify your connection.</p>
          <Button asChild size="sm" variant="outline">
            <Link href={`${INBOX_BASE_PATH}/settings`}>View settings</Link>
          </Button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 space-y-4 mb-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[90%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {msg.role === "assistant" && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="rounded-xl px-4 py-3 bg-muted">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your email setup…"
          rows={2}
          className="text-sm resize-none flex-1"
          disabled={!sessionId}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <Button type="submit" disabled={!input.trim() || loading || !sessionId} className="self-end gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Send
        </Button>
      </form>
    </div>
  );
}
