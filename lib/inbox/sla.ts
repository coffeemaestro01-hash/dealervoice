import prisma from "@/lib/db";
import type { InboxTicketPriority, InboxTicketStatus } from "@prisma/client";

export function getSLAStatus(ticket: {
  priority: InboxTicketPriority;
  createdAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  status: InboxTicketStatus;
}, config: { firstResponseHours: number; resolutionHours: number }) {
  const now = Date.now();
  const created = ticket.createdAt.getTime();
  const frDue = created + config.firstResponseHours * 3600_000;
  const resDue = created + config.resolutionHours * 3600_000;

  if (ticket.resolvedAt || ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
    return { fr: "met" as const, res: "met" as const };
  }
  if (!ticket.firstResponseAt && now > frDue) return { fr: "breached" as const, res: now > resDue ? "breached" as const : "ok" as const };
  if (now > resDue) return { fr: ticket.firstResponseAt ? "met" as const : "breached" as const, res: "breached" as const };
  if (!ticket.firstResponseAt && now > frDue - 2 * 3600_000) return { fr: "warning" as const, res: "ok" as const };
  if (now > resDue - 4 * 3600_000) return { fr: "ok" as const, res: "warning" as const };
  return { fr: "ok" as const, res: "ok" as const };
}

export async function loadSLAConfig(dealershipId: string, priority: string) {
  const row = await prisma.inboxSLAConfig.findUnique({
    where: { dealershipId_priority: { dealershipId, priority } },
  });
  if (row) return row;
  const defaults: Record<string, { firstResponseHours: number; resolutionHours: number }> = {
    HIGH: { firstResponseHours: 4, resolutionHours: 24 },
    MEDIUM: { firstResponseHours: 8, resolutionHours: 48 },
    LOW: { firstResponseHours: 24, resolutionHours: 72 },
  };
  return { firstResponseHours: defaults[priority]?.firstResponseHours ?? 8, resolutionHours: defaults[priority]?.resolutionHours ?? 48 };
}
