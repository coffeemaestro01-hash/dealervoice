import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, SARVAM_ENABLED } from "@/lib/support/sarvam";

// Public speech-to-text for the support widget's voice mode.
// Whitelisted in middleware (/api/support).

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB cap on uploaded audio

export async function POST(req: NextRequest) {
  if (!SARVAM_ENABLED) {
    return NextResponse.json({ error: "Voice is not configured." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large" }, { status: 413 });
  }

  try {
    const { transcript, languageCode } = await transcribeAudio(file, "audio.webm");
    return NextResponse.json({ transcript, languageCode });
  } catch (err: any) {
    console.error("Sarvam STT failed:", err?.message ?? err, err?.detail ?? "");
    return NextResponse.json({ error: "Could not transcribe audio. Please try again." }, { status: 500 });
  }
}
