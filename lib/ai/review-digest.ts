/**
 * AI Review Digest — summarizes dealership reviews for buyers.
 * Uses Gemini/OpenAI when available; falls back to keyword aggregation.
 */
import { AI_ENABLED } from "@/lib/ai";

export interface ReviewDigest {
  summary: string;
  pros: string[];
  cons: string[];
  themes: string[];
  sentiment: "positive" | "mixed" | "negative" | "neutral";
  aiGenerated: boolean;
}

export interface ReviewDigestInput {
  title: string;
  body: string;
  overallRating: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

const THEME_MAP: Record<string, string[]> = {
  "Staff Friendliness": ["friendly", "helpful", "polite", "rude", "staff", "salesperson", "team", "consultant"],
  "Pricing & Value": ["price", "pricing", "expensive", "cheap", "value", "cost", "worth", "overpriced", "fair"],
  "Service Quality": ["service", "maintenance", "repair", "quality", "workshop", "technician", "mechanic"],
  "Delivery Experience": ["delivery", "handover", "on time", "delayed", "wait", "fast", "quick"],
  "After-Sales Support": ["after-sales", "follow-up", "support", "warranty", "response", "recall", "followup"],
  "Test Drive": ["test drive", "demo", "drove", "drive"],
  "Finance & Paperwork": ["finance", "loan", "emi", "document", "paperwork", "insurance", "registration"],
};

const POS_WORDS = ["great", "excellent", "friendly", "helpful", "smooth", "transparent", "quick", "honest", "best", "fantastic", "love", "amazing", "perfect", "outstanding", "professional"];
const NEG_WORDS = ["bad", "poor", "rude", "slow", "expensive", "overpriced", "delay", "issue", "problem", "worst", "disappointed", "unprofessional", "hidden", "pushy", "ignored"];

function topKeywords(reviews: ReviewDigestInput[], positive: boolean, n = 3): string[] {
  const words = positive ? POS_WORDS : NEG_WORDS;
  const filtered = reviews.filter((r) => (positive ? r.overallRating >= 4 : r.overallRating <= 2));
  const counts: Record<string, number> = {};
  for (const r of filtered) {
    const text = `${r.title} ${r.body}`.toLowerCase();
    for (const w of words) {
      if (text.includes(w)) counts[w] = (counts[w] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
}

function extractThemes(reviews: ReviewDigestInput[], n = 4): string[] {
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    const text = `${r.title} ${r.body}`.toLowerCase();
    for (const [theme, kws] of Object.entries(THEME_MAP)) {
      if (kws.some((k) => text.includes(k))) counts[theme] = (counts[theme] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t);
}

function keywordDigest(reviews: ReviewDigestInput[]): ReviewDigest {
  const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
  const sentiment: ReviewDigest["sentiment"] =
    avg >= 4 ? "positive" : avg >= 3 ? "mixed" : avg > 0 ? "negative" : "neutral";
  const posCount = reviews.filter((r) => r.overallRating >= 4).length;
  const negCount = reviews.filter((r) => r.overallRating <= 2).length;
  const themes = extractThemes(reviews);
  const pros = topKeywords(reviews, true);
  const cons = topKeywords(reviews, false);
  const topThemes = themes.slice(0, 2).join(" and ").toLowerCase() || "overall experience";
  const summary = `Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}, buyers most often mention ${topThemes}. ${posCount} rated 4★ or above${negCount > 0 ? `; ${negCount} raised concerns` : ""}.`;
  return { summary, pros, cons, themes, sentiment, aiGenerated: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI-POWERED DIGEST
// ─────────────────────────────────────────────────────────────────────────────

async function aiDigest(reviews: ReviewDigestInput[]): Promise<ReviewDigest> {
  const sample = reviews
    .slice(0, 20)
    .map((r) => `[${r.overallRating}★] ${r.title}: ${r.body.slice(0, 200)}`)
    .join("\n\n");

  const prompt = `Summarize these ${reviews.length} car dealership reviews for a car buyer doing research. Be concise and factual.

Reviews:
${sample}

Return JSON only:
{
  "summary": "2-3 sentences covering the overall buyer experience",
  "pros": ["up to 3 most-praised aspects"],
  "cons": ["up to 3 most-criticized aspects, empty array if none"],
  "themes": ["up to 4 key topics discussed"],
  "sentiment": "positive|mixed|negative|neutral"
}`;

  let raw = "";

  if (process.env.GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    const data = await res.json();
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } else if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    const data = await res.json();
    raw = data.choices?.[0]?.message?.content ?? "";
  }

  const parsed = JSON.parse(raw);
  return {
    summary: parsed.summary ?? "",
    pros: Array.isArray(parsed.pros) ? parsed.pros : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons : [],
    themes: Array.isArray(parsed.themes) ? parsed.themes : [],
    sentiment: parsed.sentiment ?? "neutral",
    aiGenerated: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export async function generateReviewDigest(
  reviews: ReviewDigestInput[]
): Promise<ReviewDigest> {
  if (reviews.length === 0) {
    return {
      summary: "No reviews yet.",
      pros: [],
      cons: [],
      themes: [],
      sentiment: "neutral",
      aiGenerated: false,
    };
  }

  if (!AI_ENABLED) return keywordDigest(reviews);

  try {
    return await aiDigest(reviews);
  } catch {
    return keywordDigest(reviews);
  }
}
