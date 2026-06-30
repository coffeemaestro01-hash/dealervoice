import prisma from "@/lib/db";
import {
  DEFAULT_INBOX_SLA,
  INBOX_STARTER_AUTOMATIONS,
  INBOX_STARTER_TEMPLATES,
} from "@/lib/inbox/starter-content";

export async function seedInboxForDealership(dealershipId: string) {
  const existing = await prisma.inboxCannedResponse.count({ where: { dealershipId } });
  if (existing > 0) return { seeded: false };

  await prisma.inboxCannedResponse.createMany({
    data: INBOX_STARTER_TEMPLATES.map((t) => ({
      dealershipId,
      title: t.title,
      body: t.body,
      shortcut: t.shortcut,
      category: t.category,
    })),
  });

  await prisma.inboxAutomationRule.createMany({
    data: INBOX_STARTER_AUTOMATIONS.map((r) => ({
      dealershipId,
      name: r.name,
      trigger: r.trigger,
      conditions: r.conditions,
      actions: r.actions,
      isActive: true,
    })),
  });

  for (const sla of DEFAULT_INBOX_SLA) {
    await prisma.inboxSLAConfig.upsert({
      where: { dealershipId_priority: { dealershipId, priority: sla.priority } },
      create: { dealershipId, ...sla },
      update: { label: sla.label, firstResponseHours: sla.firstResponseHours, resolutionHours: sla.resolutionHours },
    });
  }

  return { seeded: true };
}
