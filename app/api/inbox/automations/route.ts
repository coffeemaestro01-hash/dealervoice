import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  trigger: z.string().min(1).max(80),
  conditions: z.array(z.record(z.unknown())).min(1),
  actions: z.array(z.record(z.unknown())).min(1),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const { dealershipId } = await requireInboxSession();

    const rules = await prisma.inboxAutomationRule.findMany({
      where: { dealershipId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: rules });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dealershipId } = await requireInboxSession();
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const rule = await prisma.inboxAutomationRule.create({
      data: {
        dealershipId,
        name: parsed.data.name,
        trigger: parsed.data.trigger,
        conditions: parsed.data.conditions as Prisma.InputJsonValue,
        actions: parsed.data.actions as Prisma.InputJsonValue,
        isActive: parsed.data.isActive ?? true,
      },
    });

    return NextResponse.json({ data: rule }, { status: 201 });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
