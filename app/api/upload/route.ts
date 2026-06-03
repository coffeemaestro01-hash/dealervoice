import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/auth/rate-limit";
import crypto from "crypto";
import { z } from "zod";

const BUCKET = process.env.S3_BUCKET || "dealer-assets";
const SUPABASE_URL = process.env.SUPABASE_URL;

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

  // Generate signed upload URL via Supabase
  const { data, error } = await supabaseAdmin
    .storage
    .from(BUCKET)
    .createSignedUploadUrl(key);

  if (error || !data) {
    console.error("Supabase Storage Error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }

  // Construct public URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    key,
    publicUrl,
  });
}
