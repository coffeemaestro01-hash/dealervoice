"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatInboxTicketId, INBOX_BASE_PATH } from "@/lib/inbox/constants";

type Message = {
  id: string;
  body: string;
  from: string;
  to: string;
  direction: "INBOUND" | "OUTBOUND" | "INTERNAL";
  isAiDraft: boolean;
  createdAt: string;
  author?: { name: string } | null;
};

type TicketDetail = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  createdAt: string;
  contact: { name: string | null; email: string; phone: string | null };
  messages: Message[];
};

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const loadTicket = useCallback(() => {
    setLoading(true);
    fetch(`/api/inbox/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => setTicket(d.data ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/inbox/tickets/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setReply("");
      loadTicket();
    }
  }

  async function handleAiDraft() {
    setDrafting(true);
    const res = await fetch("/api/inbox/ai-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: id }),
    });
    const payload = await res.json();
    setDrafting(false);
    if (res.ok && payload.data?.body) {
      setReply(payload.data.body);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading ticket…
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Link href={`${INBOX_BASE_PATH}/inbox`} className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href={`${INBOX_BASE_PATH}/inbox`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ArrowLeft size={16} />
        Back to inbox
      </Link>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground">
            {formatInboxTicketId(ticket.ticketNumber)}
          </span>
          <Badge variant="outline">{ticket.status.replace(/_/g, " ")}</Badge>
          <Badge variant="outline">{ticket.priority}</Badge>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{ticket.subject}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {ticket.contact.name ?? ticket.contact.email}
          {ticket.contact.phone && ` · ${ticket.contact.phone}`}
          {" · "}
          {format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "rounded-xl border p-4 max-w-[85%]",
              msg.direction === "OUTBOUND"
                ? "ml-auto bg-primary/5 border-primary/20"
                : "bg-card border-border"
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-foreground">
                {msg.direction === "OUTBOUND" ? "You" : msg.from}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(msg.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{msg.body}</p>
            {msg.isAiDraft && (
              <span className="text-xs text-primary mt-2 inline-block">AI draft</span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Reply</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-muted-foreground hover:text-primary"
            onClick={handleAiDraft}
            disabled={drafting}
          >
            {drafting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI draft
          </Button>
        </div>
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your reply…"
          rows={5}
          className="text-sm"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!reply.trim() || sending} className="gap-2">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send reply
          </Button>
        </div>
      </form>
    </div>
  );
}
