import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { rateLimit } from "@/lib/auth/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

const BUCKET = process.env.S3_BUCKET || "dealervoice-media";
const CDN = process.env.NEXT_PUBLIC_CDN_URL || `https://${BUCKET}.s3.amazonaws.com`;

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic",
  "application/pdf",
  "video/mp4",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const schema = z.object({
  filename: z.string().max(255),
  contentType: z.string(),
  size: z.number().max(MAX_SIZE),
  purpose: z.enum(["review", "dealership", "verification", "avatar"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimit(req, "upload");
  if (!rl.success) return NextResponse.json({ error: "Upload limit exceeded" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 422 });
  }

  const { filename, contentType, size, purpose } = parsed.data;

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "bin";
  const key = `${purpose}/${session.user.id}/${crypto.randomBytes(16).toString("hex")}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    Metadata: { userId: session.user.id, purpose },
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({
    uploadUrl: presignedUrl,
    key,
    publicUrl: `${CDN}/${key}`,
  });
}
