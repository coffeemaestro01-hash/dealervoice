"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Mic, Square } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the DealerVoice assistant. Ask me about reviews, claiming a dealership, pricing, or your data. Type or tap the mic to talk.",
};

function base64WavToUrl(b64: string): string {
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return URL.createObjectURL(new Blob([arr], { type: "audio/wav" }));
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState(""); // transient status line (listening / transcribing...)

  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, status]);

  // Cleanup any object URL / stream on unmount.
  useEffect(() => {
    return () => {
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const speak = useCallback(async (text: string, languageCode: string) => {
    try {
      const res = await fetch("/api/support/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.audio) return;
      const url = base64WavToUrl(data.audio);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        audioRef.current.onended = () => URL.revokeObjectURL(url);
      }
    } catch {
      /* speech is best-effort; ignore */
    }
  }, []);

  // Core: send a user message through chat, optionally speak the reply.
  const sendMessage = useCallback(
    async (text: string, opts?: { speak?: boolean; lang?: string }) => {
      const clean = text.trim();
      if (!clean || loading) return;
      const next = [...messages, { role: "user" as const, content: clean }];
      setMessages(next);
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next.filter((_, i) => i !== 0) }),
        });
        const data = await res.json();
        const reply =
          res.ok && data.reply
            ? data.reply
            : data.error ?? "Sorry, something went wrong. Please email support@dealervoice.io.";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (opts?.speak && res.ok && data.reply) speak(reply, opts.lang ?? "en-US");
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Network error. Please try again or email support@dealervoice.io." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, speak]
  );

  const sendTyped = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage(text);
  }, [input, sendMessage]);

  // Voice: start/stop recording. On stop -> STT -> sendMessage(speak: true).
  const startRecording = useCallback(async () => {
    if (recording || loading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        setStatus("Transcribing...");
        setLoading(true);
        try {
          const form = new FormData();
          form.append("file", blob, "audio.webm");
          const res = await fetch("/api/support/stt", { method: "POST", body: form });
          const data = await res.json();
          setLoading(false);
          if (res.ok && data.transcript) {
            await sendMessage(data.transcript, { speak: true, lang: data.languageCode });
          } else {
            setStatus("");
            setMessages((m) => [
              ...m,
              { role: "assistant", content: "I couldn't hear that clearly. Please try again or type your question." },
            ]);
          }
        } catch {
          setLoading(false);
          setStatus("");
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setStatus("Listening... tap to stop");
    } catch {
      setStatus("");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I need microphone permission to listen. You can also type your question." },
      ]);
    }
  }, [recording, loading, sendMessage]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  }, []);

  return (
    <>
      <audio ref={audioRef} hidden />

      {/* Launcher */}
      {!open && (
        <button
          aria-label="Open support chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 grid place-items-center w-14 h-14 rounded-full bg-ember text-night-900 shadow-ember hover:opacity-90 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl bg-card border border-primary/30 shadow-ember overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 bg-pearl text-foreground">
            <div>
              <p className="font-semibold leading-tight">DealerVoice Support</p>
              <p className="text-xs text-foreground leading-tight">AI assistant · type or talk</p>
            </div>
            <button aria-label="Close support chat" onClick={() => setOpen(false)} className="text-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-ember text-night-900 font-medium rounded-br-sm"
                      : "bg-card text-foreground border border-border rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {(loading || status) && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2 text-muted-foreground text-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {status || "Thinking..."}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendTyped();
            }}
            className="flex items-center gap-2 p-3 border-t border-border bg-card"
          >
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={loading && !recording}
              aria-label={recording ? "Stop recording" : "Record voice message"}
              className={`grid place-items-center w-10 h-10 rounded-full shrink-0 transition disabled:opacity-40 ${
                recording ? "bg-destructive/10 text-foreground animate-pulse" : "bg-muted text-muted-foreground hover:bg-muted"
              }`}
            >
              {recording ? <Square size={16} /> : <Mic size={18} />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recording ? "Listening..." : "Type your question..."}
              maxLength={2000}
              disabled={recording}
              className="flex-1 h-10 rounded-full border border-border px-4 text-sm focus:outline-none focus:border-primary/30 disabled:bg-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="grid place-items-center w-10 h-10 rounded-full bg-ember text-night-900 disabled:opacity-40 hover:opacity-90 transition shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
