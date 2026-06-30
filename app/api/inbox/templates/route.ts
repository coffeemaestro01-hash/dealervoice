import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  shortcut: z.string().max(40).optional(),
  category: z.string().max(80).optional(),
});

export async function GET() {
  try {
    const { dealershipId } = await requireInboxSession();

    const templates = await prisma.inboxCannedResponse.findMany({
      where: { dealershipId, isActive: true },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return NextResponse.json({ data: templates });
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

    const template = await prisma.inboxCannedResponse.create({
      data: {
        dealershipId,
        title: parsed.data.title,
        body: parsed.data.body,
        shortcut: parsed.data.shortcut,
        category: parsed.data.category,
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
