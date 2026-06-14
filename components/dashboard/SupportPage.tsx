"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Plus, MessageSquare } from "lucide-react";
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
  createdAt: string;
  replies: TicketReply[];
}

const CATEGORIES = ["BILLING", "TECHNICAL", "CLAIM", "REVIEWS", "OTHER"] as const;

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("OTHER");
  const [submitting, setSubmitting] = useState(false);

  function loadTickets() {
    fetch("/api/dealer/support/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/dealer/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, category }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubject("");
      setMessage("");
      setCategory("OTHER");
      setShowForm(false);
      loadTickets();
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading support tickets…</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gold-50 text-gold-700">
            <LifeBuoy size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-500 text-sm">Get help with billing, claims, reviews, and more.</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          New ticket
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Submit a support request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Brief summary of your issue"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Describe your issue in detail"
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tickets.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No support tickets yet. Create one if you need help.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base font-semibold">{ticket.subject}</CardTitle>
                  <Badge variant="outline">{ticket.status.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-gray-400">
                  {ticket.category.replace(/_/g, " ")} · {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                {ticket.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {ticket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`rounded-lg p-3 text-sm ${
                          reply.isStaff ? "bg-gold-50 border border-gold-100" : "bg-gray-50"
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {reply.user.name}
                          {reply.isStaff ? " · DealerVoice Support" : ""} ·{" "}
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
