import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeSpeech, SARVAM_ENABLED } from "@/lib/support/sarvam";

// Public text-to-speech for the support widget's voice mode.
// Whitelisted in middleware (/api/support).

const schema = z.object({
  text: z.string().min(1).max(1500),
  languageCode: z.string().max(10).optional(),
});

export async function POST(req: NextRequest) {
  if (!SARVAM_ENABLED) {
    return NextResponse.json({ error: "Voice is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  try {
    const audio = await synthesizeSpeech(parsed.data.text, parsed.data.languageCode);
    return NextResponse.json({ audio }); // base64 WAV
  } catch (err: any) {
    console.error("Sarvam TTS failed:", err?.message ?? err, err?.detail ?? "");
    return NextResponse.json({ error: "Could not generate audio." }, { status: 500 });
  }
}
