// AI features are disabled when OPENAI_API_KEY is not set.
// All functions return safe no-op defaults in that case.

const AI_ENABLED = !!process.env.OPENAI_API_KEY;

export interface SentimentResult {
  score: number;
  label: "positive" | "neutral" | "negative";
  confidence: number;
}

export interface SpamResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

export interface ReviewSummary {
  summary: string;
  keyThemes: string[];
  pros: string[];
  cons: string[];
}

export interface ResponseSuggestion {
  suggestion: string;
  tone: "professional" | "apologetic" | "grateful";
}

// Lazy-load OpenAI only when AI is actually enabled and package is installed
async function getOpenAI() {
  try {
    const { default: OpenAI } = await import("openai");
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch {
    throw new Error("openai package not installed. Run: npm install openai");
  }
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (!AI_ENABLED) return { score: 0, label: "neutral", confidence: 0 };
  try {
    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Analyze the sentiment of this review text. Return JSON: { score: float -1 to 1, label: positive|neutral|negative, confidence: float 0 to 1 }" },
        { role: "user", content: text.slice(0, 2000) },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return { score: result.score ?? 0, label: result.label ?? "neutral", confidence: result.confidence ?? 0.5 };
  } catch {
    return { score: 0, label: "neutral", confidence: 0 };
  }
}

export async function detectSpam(review: {
  title: string;
  body: string;
  authorHistory?: { reviewCount: number; avgRating: number };
}): Promise<SpamResult> {
  if (!AI_ENABLED) return { isSpam: false, score: 0, reasons: [] };
  try {
    const openai = await getOpenAI();
    const prompt = `Analyze this dealer review for spam/fake indicators:\nTitle: ${review.title}\nBody: ${review.body.slice(0, 1500)}\nReturn JSON: { isSpam: boolean, score: 0-1, reasons: string[] }`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You detect fake or spam reviews. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return { isSpam: result.isSpam ?? false, score: result.score ?? 0, reasons: result.reasons ?? [] };
  } catch {
    return { isSpam: false, score: 0, reasons: [] };
  }
}

export async function summarizeReviews(reviews: Array<{ title: string; body: string; rating: number }>): Promise<ReviewSummary> {
  if (!AI_ENABLED) return { summary: "", keyThemes: [], pros: [], cons: [] };
  try {
    const openai = await getOpenAI();
    const reviewText = reviews.slice(0, 50).map((r) => `[${r.rating}/5] ${r.title}: ${r.body.slice(0, 300)}`).join("\n\n");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize these dealership reviews. Return JSON: { summary: string, keyThemes: string[], pros: string[], cons: string[] }" },
        { role: "user", content: reviewText },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return { summary: result.summary ?? "", keyThemes: result.keyThemes ?? [], pros: result.pros ?? [], cons: result.cons ?? [] };
  } catch {
    return { summary: "", keyThemes: [], pros: [], cons: [] };
  }
}

export async function generateResponseSuggestion(review: {
  title: string;
  body: string;
  rating: number;
  dealerName: string;
}): Promise<ResponseSuggestion> {
  if (!AI_ENABLED) return { suggestion: "", tone: "professional" };
  try {
    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Write professional dealer responses. Return JSON: { suggestion: string, tone: professional|apologetic|grateful }" },
        { role: "user", content: `Generate a response to this ${review.rating}/5 review of "${review.dealerName}":\nTitle: ${review.title}\n${review.body.slice(0, 1000)}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return { suggestion: result.suggestion ?? "", tone: result.tone ?? "professional" };
  } catch {
    return { suggestion: "", tone: "professional" };
  }
}

export async function generateReputationInsights(data: {
  dealerName: string;
  overallRating: number;
  reputationScore: number;
  totalReviews: number;
  ratingTrend: number;
  topThemes: string[];
  industryAvgRating: number;
}): Promise<string> {
  if (!AI_ENABLED) return "";
  try {
    const openai = await getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a dealership reputation consultant. Provide actionable insights." },
        { role: "user", content: `Dealership: ${data.dealerName}\nRating: ${data.overallRating}/5 (industry avg: ${data.industryAvgRating})\nReputation: ${data.reputationScore}/100\nReviews: ${data.totalReviews}\nTrend: ${data.ratingTrend > 0 ? "+" : ""}${data.ratingTrend}\nThemes: ${data.topThemes.join(", ")}\n\nProvide 3-4 actionable insights.` },
      ],
      max_tokens: 400,
    });
    return response.choices[0].message.content ?? "";
  } catch {
    return "";
  }
}
