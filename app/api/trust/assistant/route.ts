import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AI_ENABLED } from "@/lib/ai";

// Public Dream Car Assistant endpoint — no auth required.
// Helps buyers find the right dealer using Gemini or OpenAI.

const SYSTEM_PROMPT = `You are the DealerVoice Dream Car Assistant — a friendly, knowledgeable AI that helps car buyers find the right dealership.

YOUR JOB:
- Help buyers narrow down dealerships by brand, city, budget, vehicle type (new/used/EV/luxury), and service preferences.
- Explain what makes a dealer trustworthy: verified reviews, Trust Score, response rate, claimed profile.
- Suggest search strategies on DealerVoice (e.g., "Search for Toyota dealers in Delhi at /dealers").
- Answer questions about the car-buying journey honestly.

RULES:
- Never recommend a specific dealer by name unless the user has already named one.
- Never mention paid placements or sponsored results as if they were merit-based.
- Be concise: max 3-4 sentences per response unless the user asks for detail.
- If you don't know something, say so — don't fabricate dealership data.
- Keep a friendly, helpful, non-salesy tone.

DealerVoice Trust Score is 0-100, based on: avg rating (35%), verified review ratio (20%), response rate (15%), resolution rate (10%), freshness (10%), trend (10%). Claimed profiles earn up to +10 bonus points.`;

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1000),
      })
    )
    .min(1)
    .max(20),
});

async function callGemini(history: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;

  // Gemini uses a different format: system prompt as first user turn trick
  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nNow begin helping the buyer." }] },
    { role: "model", parts: [{ text: "Understood! I'm ready to help you find the perfect dealer." }] },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gemini error: ${err.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callOpenAI(history: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY!;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`OpenAI error: ${err.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  if (!AI_ENABLED) {
    return NextResponse.json(
      {
        reply:
          "The AI assistant isn't configured yet, but you can search for dealers at /dealers or read our buying guide.",
      },
      { status: 200 }
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

  const history = parsed.data.messages;
  if (history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  try {
    let reply = "";
    if (process.env.GEMINI_API_KEY) {
      reply = await callGemini(history);
    } else if (process.env.OPENAI_API_KEY) {
      reply = await callOpenAI(history);
    }

    if (!reply) {
      return NextResponse.json(
        { reply: "I couldn't generate a response. Please try again or search at /dealers." },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Dream Car Assistant error:", message);
    return NextResponse.json(
      { reply: "I'm having trouble right now. Please try again in a moment or search at /dealers." },
      { status: 200 }
    );
  }
}
