import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/auth/rate-limit";
import crypto from "crypto";

const BUCKET = process.env.S3_BUCKET || "dealer-assets";
const SUPABASE_URL = process.env.SUPABASE_URL;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];
const MAX_SIZE = 20 * 1024 * 1024;
const PURPOSES = ["review", "dealership", "verification", "avatar"] as const;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimit(req, "upload");
  if (!rl.success) return NextResponse.json({ error: "Upload limit exceeded" }, { status: 429 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const purpose = formData.get("purpose");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!purpose || !PURPOSES.includes(purpose as (typeof PURPOSES)[number])) {
    return NextResponse.json({ error: "Invalid upload purpose" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${purpose}/${session.user.id}/${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(key, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[upload/file]", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;
  return NextResponse.json({ publicUrl, key });
}
