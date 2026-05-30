// AI disabled for lean launch — no openai package installed.
// All functions return safe no-op defaults.

export interface SentimentResult { score: number; label: "positive" | "neutral" | "negative"; confidence: number; }
export interface SpamResult { isSpam: boolean; score: number; reasons: string[]; }
export interface ReviewSummary { summary: string; keyThemes: string[]; pros: string[]; cons: string[]; }
export interface ResponseSuggestion { suggestion: string; tone: "professional" | "apologetic" | "grateful"; }

export async function analyzeSentiment(_text: string): Promise<SentimentResult> {
  return { score: 0, label: "neutral", confidence: 0 };
}
export async function detectSpam(_review: { title: string; body: string; authorHistory?: { reviewCount: number; avgRating: number }; }): Promise<SpamResult> {
  return { isSpam: false, score: 0, reasons: [] };
}
export async function summarizeReviews(_reviews: Array<{ title: string; body: string; rating: number }>): Promise<ReviewSummary> {
  return { summary: "", keyThemes: [], pros: [], cons: [] };
}
export async function generateResponseSuggestion(_review: { title: string; body: string; rating: number; dealerName: string; }): Promise<ResponseSuggestion> {
  return { suggestion: "", tone: "professional" };
}
export async function generateReputationInsights(_data: { dealerName: string; overallRating: number; reputationScore: number; totalReviews: number; ratingTrend: number; topThemes: string[]; industryAvgRating: number; }): Promise<string> {
  return "";
}
