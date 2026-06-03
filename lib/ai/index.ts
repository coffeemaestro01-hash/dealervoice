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

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER INTEGRATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
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

// ─────────────────────────────────────────────────────────────────────────────
// AI FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeSentiment(_text: string): Promise<SentimentResult> {
  return { score: 0, label: "neutral", confidence: 0 };
}

export async function detectSpam(_review: { title: string; body: string }): Promise<SpamResult> {
  return { isSpam: false, score: 0, reasons: [] };
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
  const isGeminiEnabled = !!process.env.GEMINI_API_KEY;
  const isOpenAIEnabled = !!process.env.OPENAI_API_KEY;

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

  if (isGeminiEnabled) {
    try {
      const result = await callGemini(prompt);
      return JSON.parse(result);
    } catch (e) {
      console.error("Gemini fallback to OpenAI/Template due to error:", e);
    }
  }

  if (isOpenAIEnabled) {
    try {
      const result = await callOpenAI(prompt);
      return JSON.parse(result);
    } catch (e) {
      console.error("OpenAI fallback to Template due to error:", e);
    }
  }

  // Final Fallback: Static Template
  return {
    description: `Welcome to ${data.name}, your trusted ${data.category.toLowerCase().replace("_", " ")} destination in ${data.city}. We are committed to delivering exceptional value and personalized service to every customer who walks through our doors.`,
    specialties: ["Customer Satisfaction", "Quality Inventory", "Transparent Pricing"],
    valueProposition: `At ${data.name}, we don't just sell vehicles; we build long-lasting relationships through honesty and integrity.`,
    serviceHighlights: ["New & Pre-Owned Sales", "Professional Maintenance", "Flexible Financing"],
    summary: `${data.name} is a leading ${data.category.toLowerCase()} provider serving the ${data.city} community with excellence.`,
  };
}

export async function generateResponseSuggestion(_review: { title: string; body: string; rating: number; dealerName: string; }): Promise<ResponseSuggestion> {
  return { suggestion: "", tone: "professional" };
}

export async function generateReputationInsights(_data: any): Promise<string> {
  return "";
}
