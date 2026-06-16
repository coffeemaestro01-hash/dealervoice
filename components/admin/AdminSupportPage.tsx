"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketReply {
  id: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
  user: { name: string };
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: { name: string; email: string };
  dealership: { name: string; slug: string } | null;
  replies: TicketReply[];
}

export function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});

  function loadTickets() {
    setLoading(true);
    fetch(`/api/admin/support/tickets?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Ticket[] = d.data ?? [];
        setTickets(list);
        setNotesDrafts(
          Object.fromEntries(list.map((t) => [t.id, t.adminNotes ?? ""]))
        );
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  async function patchTicket(id: string, body: Record<string, string>) {
    await fetch(`/api/admin/support/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    loadTickets();
  }

  if (loading && tickets.length === 0) {
    return <div className="p-8 text-muted-foreground">Loading support queue…</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Support tickets</h1>
      <p className="text-sm text-muted-foreground mb-6">Dealer support requests — reply and close from here.</p>

      <div className="flex gap-2 mb-6">
        {(["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              statusFilter === s ? "bg-primary text-foreground" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tickets in this queue.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticket.user.name} · {ticket.user.email}
                      {ticket.dealership ? ` · ${ticket.dealership.name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.category} · {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge>{ticket.status.replace(/_/g, " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.message}</p>

                {ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded-lg p-3 text-sm ${
                      reply.isStaff ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {reply.user.name} · {new Date(reply.createdAt).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap">{reply.body}</p>
                  </div>
                ))}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Internal notes</label>
                  <textarea
                    rows={2}
                    value={notesDrafts[ticket.id] ?? ""}
                    onChange={(e) =>
                      setNotesDrafts((d) => ({ ...d, [ticket.id]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => patchTicket(ticket.id, { adminNotes: notesDrafts[ticket.id] ?? "" })}
                  >
                    Save notes
                  </Button>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Reply to dealer</label>
                  <textarea
                    rows={3}
                    value={replyDrafts[ticket.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((d) => ({ ...d, [ticket.id]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Your reply…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {replyDrafts[ticket.id]?.trim() && (
                    <Button
                      size="sm"
                      onClick={() => {
                        patchTicket(ticket.id, { reply: replyDrafts[ticket.id] });
                        setReplyDrafts((d) => ({ ...d, [ticket.id]: "" }));
                      }}
                    >
                      Send reply
                    </Button>
                  )}
                  {ticket.status !== "IN_PROGRESS" && (
                    <Button size="sm" variant="outline" onClick={() => patchTicket(ticket.id, { status: "IN_PROGRESS" })}>
                      In progress
                    </Button>
                  )}
                  {ticket.status !== "RESOLVED" && (
                    <Button size="sm" variant="outline" onClick={() => patchTicket(ticket.id, { status: "RESOLVED" })}>
                      Resolve
                    </Button>
                  )}
                  {ticket.status !== "CLOSED" && (
                    <Button size="sm" variant="outline" onClick={() => patchTicket(ticket.id, { status: "CLOSED" })}>
                      Close
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
