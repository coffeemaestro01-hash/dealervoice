import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireInboxSession, inboxErrorResponse } from "@/lib/inbox/session";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  filters: z.record(z.unknown()),
  isShared: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const { dealershipId, userId } = await requireInboxSession();

    const views = await prisma.inboxSavedView.findMany({
      where: {
        dealershipId,
        OR: [{ isShared: true }, { ownerId: userId }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: views });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dealershipId, userId } = await requireInboxSession();
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 422 });
    }

    const view = await prisma.inboxSavedView.create({
      data: {
        dealershipId,
        ownerId: userId,
        name: parsed.data.name,
        filters: parsed.data.filters as Prisma.InputJsonValue,
        isShared: parsed.data.isShared ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ data: view }, { status: 201 });
  } catch (err) {
    return inboxErrorResponse(err);
  }
}
