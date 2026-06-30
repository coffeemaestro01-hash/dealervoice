"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatInboxTicketId, INBOX_BASE_PATH } from "@/lib/inbox/constants";

type TicketCard = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  contact: { name: string | null; email: string };
};

const COLUMNS = ["NEW", "OPEN", "IN_PROGRESS", "WAITING", "RESOLVED"] as const;

const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  NEW: "New",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
};

const COLUMN_STYLE: Record<(typeof COLUMNS)[number], string> = {
  NEW: "border-primary/30 bg-primary/5",
  OPEN: "border-blue-500/30 bg-blue-500/5",
  IN_PROGRESS: "border-amber-500/30 bg-amber-500/5",
  WAITING: "border-purple-500/30 bg-purple-500/5",
  RESOLVED: "border-border bg-muted/30",
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: "bg-destructive",
  MEDIUM: "bg-primary",
  LOW: "bg-muted-foreground",
};

export default function KanbanPage() {
  const [tickets, setTickets] = useState<TicketCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inbox/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, TicketCard[]> = {};
    for (const col of COLUMNS) map[col] = [];
    for (const t of tickets) {
      const key = COLUMNS.includes(t.status as (typeof COLUMNS)[number]) ? t.status : "OPEN";
      map[key].push(t);
    }
    return map;
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading board…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Kanban</h2>
        <p className="text-sm text-muted-foreground mt-1">Track tickets by status across your team.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-shrink-0 w-72">
            <div className={cn("rounded-xl border p-3 min-h-[420px]", COLUMN_STYLE[col])}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-foreground">{COLUMN_LABELS[col]}</h3>
                <Badge variant="outline" className="text-xs">
                  {grouped[col].length}
                </Badge>
              </div>

              <div className="space-y-2">
                {grouped[col].map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`${INBOX_BASE_PATH}/tickets/${ticket.id}`}
                    className="block rounded-lg border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn("w-2 h-2 rounded-full shrink-0", PRIORITY_DOT[ticket.priority] ?? "bg-muted-foreground")}
                      />
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatInboxTicketId(ticket.ticketNumber)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {ticket.contact.name ?? ticket.contact.email}
                    </p>
                  </Link>
                ))}

                {grouped[col].length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tickets</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
