import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSLAStatus, loadSLAConfig } from "@/lib/inbox/sla";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";

export async function GET() {
  try {
    const { dealershipId } = await requireInboxSession();

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const [openCount, newToday, resolvedToday, statusCounts, recentTickets] = await Promise.all([
      prisma.inboxTicket.count({
        where: { dealershipId, status: { in: ["NEW", "OPEN", "IN_PROGRESS", "WAITING"] } },
      }),
      prisma.inboxTicket.count({
        where: { dealershipId, createdAt: { gte: dayStart } },
      }),
      prisma.inboxTicket.count({
        where: { dealershipId, resolvedAt: { gte: dayStart } },
      }),
      prisma.inboxTicket.groupBy({
        by: ["status"],
        where: { dealershipId },
        _count: { _all: true },
      }),
      prisma.inboxTicket.findMany({
        where: { dealershipId, status: { in: ["NEW", "OPEN", "IN_PROGRESS", "WAITING"] } },
        select: {
          id: true,
          priority: true,
          status: true,
          createdAt: true,
          firstResponseAt: true,
          resolvedAt: true,
        },
        take: 100,
      }),
    ]);

    let slaBreached = 0;
    let slaWarning = 0;
    for (const ticket of recentTickets) {
      const config = await loadSLAConfig(dealershipId, ticket.priority);
      const sla = getSLAStatus(ticket, config);
      if (sla.fr === "breached" || sla.res === "breached") slaBreached += 1;
      else if (sla.fr === "warning" || sla.res === "warning") slaWarning += 1;
    }

    const responded = await prisma.inboxTicket.findMany({
      where: { dealershipId, firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true },
      orderBy: { firstResponseAt: "desc" },
      take: 50,
    });

    const avgFirstResponseMinutes =
      responded.length > 0
        ? Math.round(
            responded.reduce((sum: number, t: { createdAt: Date; firstResponseAt: Date | null }) => {
              const ms = t.firstResponseAt!.getTime() - t.createdAt.getTime();
              return sum + ms / 60_000;
            }, 0) / responded.length
          )
        : null;

    return NextResponse.json({
      data: {
        openCount,
        newToday,
        resolvedToday,
        avgFirstResponseMinutes,
        slaBreached,
        slaWarning,
        byStatus: Object.fromEntries(
          statusCounts.map((s: { status: string; _count: { _all: number } }) => [s.status, s._count._all])
        ),
      },
    });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
