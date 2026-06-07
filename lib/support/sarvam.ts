// Sarvam AI support assistant — server-side only.
// SARVAM_API_KEY must never reach the client. This module is imported by
// app/api/support/chat/route.ts (a server route handler) only.

const SARVAM_CHAT_URL = "https://api.sarvam.ai/v1/chat/completions";
const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
const MODEL = "sarvam-30b";
const STT_MODEL = "saarika:v2.5";
const TTS_MODEL = "bulbul:v2";
const TTS_MAX_CHARS = 1500; // bulbul per-request text limit

export const SARVAM_ENABLED = !!process.env.SARVAM_API_KEY;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// DealerVoice knowledge base. Keep this grounded in real, public site content
// so the assistant gives OUR answers, not generic ones. Update as the product
// evolves. (No solo/AI-operation details — those stay internal.)
const KNOWLEDGE = `
ABOUT DEALERVOICE
- DealerVoice is a trusted reviews and reputation platform for car dealerships, in India and worldwide.
- Customers read and write honest, verified reviews. Dealers claim their profile and build their reputation.

REPUTATION SCORE
- Every dealership gets a 0-100 DealerVoice score, calculated transparently.
- Factors: average star rating (largest factor), review volume, verification ratio, recency, and how responsively the dealer replies to reviews.
- We never edit, hide, or down-rank a review for being negative. Dealers can reply to reviews but cannot change a reviewer's words. A better score cannot be bought; paid plans unlock tools, not ratings.

REVIEWS
- Reviews come only from people reporting a genuine experience with a dealership.
- Where possible reviews are verified via proof of purchase or service and labelled "Verified Purchase" / "Verified Visit". Unverified reviews are labelled but never suppressed.
- Suspected fake or policy-violating reviews go to moderation, not silent deletion.
- To write a review, sign in (email, Google, or Apple) and find the dealership page.

CLAIMING A DEALERSHIP
- Dealers can claim their profile at /claim. After verification, the owner gets dashboard access to respond to reviews and manage their listing.

PRICING (paid plans for dealers)
- There is a free dealer profile.
- Pro plan: $199/month.
- Enterprise plan: $499/month.
- Paid plans unlock tools and features, never a higher rating.
- Billing: plans are billed in advance, monthly or annual. Cancel anytime from the dashboard or by emailing billing@dealervoice.io; access continues to the end of the billing period.

PRIVACY & DATA (India DPDP Act 2023)
- Users can download their data, request corrections, delete their account, or nominate someone, all from /settings/privacy. Requests are completed within 30 days.
- Grievances (privacy, content, payment, account) can be raised at /grievance.

CONTACT
- Support email: support@dealervoice.io
- Billing email: billing@dealervoice.io
- For anything you cannot resolve, direct the user to the grievance channel at /grievance or to email support.
`.trim();

const SYSTEM_PROMPT = `You are the DealerVoice support assistant. You help visitors, customers, and dealers with questions about the DealerVoice platform.

Use ONLY the information in the knowledge base below. If you do not know an answer or it is outside DealerVoice, say so honestly and point the person to support@dealervoice.io or the grievance channel at /grievance. Do not invent features, prices, or policies.

Be warm, concise, and clear. Keep replies short (a few sentences). Use plain language. Do not use em-dashes. You may answer in the user's language (including Indian languages).

KNOWLEDGE BASE:
${KNOWLEDGE}`;

const MAX_TURNS = 12; // cap history sent upstream to control token cost

/**
 * Send a conversation to Sarvam and return the assistant's reply text.
 * Throws on transport/HTTP errors (the route handler maps these to status codes).
 */
export async function askSarvam(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_NOT_CONFIGURED");

  const trimmed = history.slice(-MAX_TURNS);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmed.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(SARVAM_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      reasoning_effort: "low", // keeps the reasoning token burn down
      max_completion_tokens: 600,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`SARVAM_HTTP_${res.status}`);
    (err as any).status = res.status;
    (err as any).detail = detail;
    throw err;
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content || !content.trim()) throw new Error("SARVAM_EMPTY_REPLY");
  return content.trim();
}

function sarvamError(res: Response, detail: string): Error {
  const err = new Error(`SARVAM_HTTP_${res.status}`);
  (err as any).status = res.status;
  (err as any).detail = detail;
  return err;
}

/**
 * Speech-to-text. Accepts a recorded audio file (any common format Sarvam
 * supports: wav, mp3, webm/ogg-opus). Returns the transcript and the detected
 * BCP-47 language code (e.g. "en-IN", "hi-IN").
 */
export async function transcribeAudio(
  file: Blob,
  filename = "audio.webm"
): Promise<{ transcript: string; languageCode: string }> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_NOT_CONFIGURED");

  const form = new FormData();
  form.append("model", STT_MODEL);
  form.append("file", file, filename);

  const res = await fetch(SARVAM_STT_URL, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: form,
  });

  if (!res.ok) throw sarvamError(res, await res.text().catch(() => ""));

  const data = await res.json();
  const transcript: string = (data?.transcript ?? "").trim();
  const languageCode: string = data?.language_code || "en-IN";
  return { transcript, languageCode };
}

/**
 * Text-to-speech. Returns base64-encoded WAV audio. languageCode should be a
 * BCP-47 code the model supports; falls back to en-IN.
 */
export async function synthesizeSpeech(
  text: string,
  languageCode = "en-IN"
): Promise<string> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_NOT_CONFIGURED");

  const res = await fetch(SARVAM_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      text: text.slice(0, TTS_MAX_CHARS),
      target_language_code: languageCode || "en-IN",
      model: TTS_MODEL,
    }),
  });

  if (!res.ok) throw sarvamError(res, await res.text().catch(() => ""));

  const data = await res.json();
  const audio: string | undefined = data?.audios?.[0];
  if (!audio) throw new Error("SARVAM_EMPTY_AUDIO");
  return audio; // base64 WAV
}
