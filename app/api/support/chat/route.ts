import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { askSarvam, SARVAM_ENABLED, type ChatMessage } from "@/lib/support/sarvam";

// Public support chat endpoint (no auth) powered by Sarvam AI.
// Whitelisted in middleware.ts so anonymous visitors can use it.

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
});

export async function POST(req: NextRequest) {
  if (!SARVAM_ENABLED) {
    return NextResponse.json(
      { error: "Support assistant is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  // Last message must be from the user.
  const history = parsed.data.messages as ChatMessage[];
  if (history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  try {
    const reply = await askSarvam(history);
    return NextResponse.json({ reply });
  } catch (err: any) {
    const status = err?.status === 401 ? 502 : 500;
    console.error("Sarvam support chat failed:", err?.message ?? err, err?.detail ?? "");
    return NextResponse.json(
      { error: "The assistant is having trouble right now. Please try again or email support@dealervoice.io." },
      { status }
    );
  }
}
