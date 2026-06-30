import prisma from "@/lib/db";

type AutomationAction = { type: string; value?: string };
type AutomationCondition = { field: string; op: string; value: unknown };

export async function runInboxAutomations(trigger: string, ticketId: string) {
  const ticket = await prisma.inboxTicket.findUnique({
    where: { id: ticketId },
    include: { contact: true, messages: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!ticket) return;

  const rules = await prisma.inboxAutomationRule.findMany({
    where: { dealershipId: ticket.dealershipId, trigger, isActive: true },
  });

  const text = `${ticket.subject} ${ticket.messages[0]?.body ?? ""}`.toLowerCase();
  let tags = [...ticket.tags];
  let priority = ticket.priority;
  let changed = false;

  for (const rule of rules) {
    const conditions = rule.conditions as AutomationCondition[];
    const match = conditions.every((c) => {
      if (c.op === "contains_any" && c.field === "subject") {
        const vals = Array.isArray(c.value) ? c.value : [c.value];
        return vals.some((v) => text.includes(String(v).toLowerCase()));
      }
      return true;
    });
    if (!match) continue;

    const actions = rule.actions as AutomationAction[];
    for (const action of actions) {
      if (action.type === "add_tag" && action.value && !tags.includes(action.value)) {
        tags.push(action.value);
        changed = true;
      }
      if (action.type === "set_priority" && action.value) {
        priority = action.value as typeof priority;
        changed = true;
      }
    }

    await prisma.inboxAutomationRule.update({
      where: { id: rule.id },
      data: { runCount: { increment: 1 } },
    });
  }

  if (changed) {
    await prisma.inboxTicket.update({
      where: { id: ticketId },
      data: { tags, priority },
    });
  }
}
