import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const schema = z.object({ isHelpful: z.boolean() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 422 });

  const review = await prisma.review.findUnique({ where: { id: id } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.authorId === session.user.id) {
    return NextResponse.json({ error: "Cannot mark your own review" }, { status: 403 });
  }

  await prisma.helpfulMark.upsert({
    where: { reviewId_userId: { reviewId: id, userId: session.user.id } },
    create: { reviewId: id, userId: session.user.id, isHelpful: parsed.data.isHelpful },
    update: { isHelpful: parsed.data.isHelpful },
  });

  // Recount
  const [helpful, unhelpful] = await Promise.all([
    prisma.helpfulMark.count({ where: { reviewId: id, isHelpful: true } }),
    prisma.helpfulMark.count({ where: { reviewId: id, isHelpful: false } }),
  ]);

  await prisma.review.update({
    where: { id: id },
    data: { helpfulCount: helpful, unhelpfulCount: unhelpful },
  });

  return NextResponse.json({ helpfulCount: helpful, unhelpfulCount: unhelpful });
}
