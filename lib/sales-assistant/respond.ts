import { AI_ENABLED } from "@/lib/ai";
import {
  buildSalesAssistantPrompt,
  type DealerAssistantContext,
} from "@/lib/sales-assistant/prompt";

async function callGemini(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  const contents = [
    { role: "user", parts: [{ text: systemPrompt + "\n\nBegin assisting the buyer now." }] },
    { role: "model", parts: [{ text: "Understood. I'm ready to help buyers for this dealership." }] },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function callOpenAI(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 450,
      temperature: 0.65,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function generateSalesAssistantReply(
  ctx: DealerAssistantContext,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  if (!AI_ENABLED) {
    return `${ctx.name} is here to help. Please call us${ctx.phone ? ` at ${ctx.phone}` : ""} or submit a quote request on this page.`;
  }

  const systemPrompt = buildSalesAssistantPrompt(ctx);
  if (process.env.GEMINI_API_KEY) return callGemini(systemPrompt, history);
  if (process.env.OPENAI_API_KEY) return callOpenAI(systemPrompt, history);
  throw new Error("AI not configured");
}
