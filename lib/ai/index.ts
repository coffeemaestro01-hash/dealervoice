/**
 * AI Infrastructure for DealerVoice
 * Supports Google Gemini (Primary) and OpenAI (Fallback)
 */

export interface SentimentResult { score: number; label: "positive" | "neutral" | "negative"; confidence: number; }
export interface SpamResult { isSpam: boolean; score: number; reasons: string[]; }
export interface ReviewSummary { summary: string; keyThemes: string[]; pros: string[]; cons: string[]; }
export interface ResponseSuggestion { suggestion: string; tone: "professional" | "apologetic" | "grateful"; }

export interface DealerProfileDraft {
  description: string;
  specialties: string[];
  valueProposition: string;
  serviceHighlights: string[];
  summary: string;
}

export const AI_ENABLED = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER INTEGRATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function callGemini(prompt: string, json = true): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: json ? { responseMimeType: "application/json" } : undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Gemini API Error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`OpenAI API Error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAI(prompt: string, json = true): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try { return await callGemini(prompt, json); } catch (e) { console.error("Gemini error:", e); }
  }
  if (process.env.OPENAI_API_KEY) {
    return callOpenAI(prompt);
  }
  throw new Error("No AI provider configured");
}

// ─────────────────────────────────────────────────────────────────────────────
// AI FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  if (!AI_ENABLED) return { score: 0, label: "neutral", confidence: 0 };

  const prompt = `Analyze the sentiment of this review text. Return JSON: {"score": -1 to 1, "label": "positive"|"neutral"|"negative", "confidence": 0 to 1}\n\nText: ${text.slice(0, 2000)}`;
  try {
    const result = await callAI(prompt);
    return JSON.parse(result);
  } catch {
    return { score: 0, label: "neutral", confidence: 0 };
  }
}

export async function detectSpam(review: { title: string; body: string }): Promise<SpamResult> {
  if (!AI_ENABLED) return { isSpam: false, score: 0, reasons: [] };

  const prompt = `Detect if this dealership review is spam/fake. Return JSON: {"isSpam": boolean, "score": 0-1, "reasons": string[]}\n\nTitle: ${review.title}\nBody: ${review.body.slice(0, 2000)}`;
  try {
    const result = await callAI(prompt);
    return JSON.parse(result);
  } catch {
    return { isSpam: false, score: 0, reasons: [] };
  }
}

export async function generateProfileDraft(data: {
  name: string;
  category: string;
  city: string;
  state?: string;
  country: string;
  website?: string;
  brands?: string[];
  context?: string;
}): Promise<DealerProfileDraft> {
  const prompt = `
    Act as a professional automotive marketing expert. 
    Generate a high-quality dealership profile based on the following information:
    
    DEALERSHIP NAME: ${data.name}
    CATEGORY: ${data.category}
    LOCATION: ${data.city}, ${data.state || ""}, ${data.country}
    BRANDS: ${data.brands?.join(", ") || "Multi-brand"}
    WEBSITE CONTEXT: ${data.context || "No website context provided."}

    REQUIREMENTS:
    - Tone: Professional, trustworthy, and welcoming.
    - Description: 2-3 compelling paragraphs about their history and mission.
    - Specialties: 3-5 unique selling points.
    - Value Proposition: A clear "Why choose us" statement.
    - Service Highlights: Key services (Sales, Service, Financing, etc).
    - Summary: A punchy one-sentence SEO meta description.

    Return ONLY a JSON object with this exact structure:
    {
      "description": "string",
      "specialties": ["string"],
      "valueProposition": "string",
      "serviceHighlights": ["string"],
      "summary": "string"
    }
  `;

  if (AI_ENABLED) {
    try {
      const result = await callAI(prompt);
      return JSON.parse(result);
    } catch (e) {
      console.error("AI profile generation fallback:", e);
    }
  }

  return {
    description: `Welcome to ${data.name}, your trusted ${data.category.toLowerCase().replace("_", " ")} destination in ${data.city}. We are committed to delivering exceptional value and personalized service to every customer who walks through our doors.`,
    specialties: ["Customer Satisfaction", "Quality Inventory", "Transparent Pricing"],
    valueProposition: `At ${data.name}, we don't just sell vehicles; we build long-lasting relationships through honesty and integrity.`,
    serviceHighlights: ["New & Pre-Owned Sales", "Professional Maintenance", "Flexible Financing"],
    summary: `${data.name} is a leading ${data.category.toLowerCase()} provider serving the ${data.city} community with excellence.`,
  };
}

export async function generateResponseSuggestion(review: {
  title: string;
  body: string;
  rating: number;
  dealerName: string;
}): Promise<ResponseSuggestion> {
  if (!AI_ENABLED) return { suggestion: "", tone: "professional" };

  const tone = review.rating >= 4 ? "grateful" : review.rating <= 2 ? "apologetic" : "professional";
  const prompt = `Write a professional dealership response to this customer review. Return JSON: {"suggestion": "2-4 sentence response", "tone": "professional"|"apologetic"|"grateful"}

Dealer: ${review.dealerName}
Rating: ${review.rating}/5
Title: ${review.title}
Review: ${review.body.slice(0, 1500)}

Be sincere, specific, and invite offline follow-up for negative reviews. Do not be defensive.`;

  try {
    const result = await callAI(prompt);
    const parsed = JSON.parse(result);
    return { suggestion: parsed.suggestion || "", tone: parsed.tone || tone };
  } catch {
    return { suggestion: "", tone };
  }
}

export async function generateReputationInsights(data: {
  dealerName: string;
  avgRating: number;
  totalReviews: number;
  recentThemes?: string[];
}): Promise<string> {
  if (!AI_ENABLED) return "";

  const prompt = `Summarize reputation insights for ${data.dealerName} (${data.avgRating}/5, ${data.totalReviews} reviews). Themes: ${data.recentThemes?.join(", ") || "none"}. Return plain text, 3-4 bullet points, actionable for the dealer manager.`;
  try {
    return (await callAI(prompt, false)).trim();
  } catch {
    return "";
  }
}
