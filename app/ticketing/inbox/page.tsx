"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Inbox, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatInboxTicketId, INBOX_BASE_PATH } from "@/lib/inbox/constants";

type TicketRow = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  contact: { name: string | null; email: string };
};

const STATUSES = ["ALL", "NEW", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const;
const PRIORITIES = ["ALL", "HIGH", "MEDIUM", "LOW"] as const;

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-primary/10 text-primary border-primary/20",
  OPEN: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  WAITING: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  RESOLVED: "bg-muted text-muted-foreground border-border",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIUM: "bg-muted text-foreground border-border",
  LOW: "bg-muted text-muted-foreground border-border",
};

export default function InboxListPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("ALL");
  const [query, setQuery] = useState("");

  const loadTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (priority !== "ALL") params.set("priority", priority);
    if (query.trim()) params.set("q", query.trim());

    fetch(`/api/inbox/tickets?${params}`)
      .then((r) => r.json())
      .then((d) => {
        let rows: TicketRow[] = d.data ?? [];
        if (priority !== "ALL") {
          rows = rows.filter((t) => t.priority === priority);
        }
        setTickets(rows);
      })
      .finally(() => setLoading(false));
  }, [status, priority, query]);

  useEffect(() => {
    const timer = setTimeout(loadTickets, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadTickets, query]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Inbox</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All customer conversations across email and web channels.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject or customer…"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          className="rounded-lg border border-border px-3 py-2 text-sm bg-background"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
          className="rounded-lg border border-border px-3 py-2 text-sm bg-background"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p === "ALL" ? "All priorities" : p}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading tickets…
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tickets yet</h3>
            <p className="text-muted-foreground max-w-sm mt-1 text-sm">
              Connect your email in Settings or complete Onboarding to start receiving customer messages.
            </p>
            <Link
              href={`${INBOX_BASE_PATH}/onboarding`}
              className="text-primary hover:underline text-sm mt-3 font-medium"
            >
              Start onboarding →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="group">
                  <TableCell>
                    <Link
                      href={`${INBOX_BASE_PATH}/tickets/${ticket.id}`}
                      className="block hover:text-primary transition-colors"
                    >
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatInboxTicketId(ticket.ticketNumber)}
                      </span>
                      <p className="font-medium text-foreground group-hover:text-primary line-clamp-1">
                        {ticket.subject}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{ticket.contact.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{ticket.contact.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", STATUS_STYLE[ticket.status])}>
                      {ticket.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", PRIORITY_STYLE[ticket.priority])}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.updatedAt), "MMM d, h:mm a")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
