import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  shortcut: z.string().max(40).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { dealershipId } = await requireInboxSession();
    const { id } = await ctx.params;

    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const existing = await prisma.inboxCannedResponse.findFirst({
      where: { id, dealershipId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const template = await prisma.inboxCannedResponse.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: template });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { dealershipId } = await requireInboxSession();
    const { id } = await ctx.params;

    const existing = await prisma.inboxCannedResponse.findFirst({
      where: { id, dealershipId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.inboxCannedResponse.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
