import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  url: z.string().url(),
  filename: z.string().max(255),
  mimeType: z.string().max(100),
  size: z.number().int().positive().max(8 * 1024 * 1024),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid file data" }, { status: 422 });
  }

  const { url, filename, mimeType, size } = parsed.data;

  // Verify review belongs to current user
  const review = await prisma.review.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, authorId: true, verificationStatus: true },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.authorId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const mediaType = mimeType === "application/pdf" ? "DOCUMENT" : "IMAGE";

  // Create media file linked as verification doc
  await prisma.mediaFile.create({
    data: {
      type: mediaType,
      url,
      key: url.split("/").slice(-2).join("/"), // approximate S3 key from URL
      filename,
      mimeType,
      size,
      isPublic: false,
      reviewVerifId: review.id,
    },
  });

  // Update review verification status to PENDING
  await prisma.review.update({
    where: { id: review.id },
    data: { verificationStatus: "PENDING" },
  });

  return NextResponse.json({ message: "Verification document submitted. We will review it shortly." });
}
