import { callAI } from "@/lib/ai";
import { normalizeInboxProvider } from "@/lib/inbox/normalize-provider";
import { runOnboardingFallback, type OnboardingAssistantResult } from "@/lib/inbox/onboarding-fallback";

export async function generateInboxDraft(input: {
  dealershipName: string;
  ticketSubject: string;
  customerMessage: string;
  templates?: { title: string; body: string }[];
}) {
  const templateHint = input.templates?.length
    ? `Available templates:\n${input.templates.map((t) => `- ${t.title}`).join("\n")}`
    : "";

  const prompt = `You are a professional customer support agent for an auto dealership named "${input.dealershipName}".
Draft a helpful, concise email reply to the customer inquiry below.
Use a friendly professional tone. Do not invent specific prices, VIN details, or appointment times unless provided.
Return JSON: { "subject": string, "body": string }

Ticket subject: ${input.ticketSubject}
Customer message:
${input.customerMessage}
${templateHint}`;

  try {
    const raw = await callAI(prompt, true);
    return JSON.parse(raw) as { subject: string; body: string };
  } catch {
    return {
      subject: `Re: ${input.ticketSubject}`,
      body: `Thank you for contacting ${input.dealershipName}. We received your message and will respond shortly.`,
    };
  }
}

export async function runOnboardingAssistant(input: {
  dealershipName: string;
  step: string;
  provider?: string;
  userMessage: string;
  transcript?: { role: string; content: string }[];
}): Promise<OnboardingAssistantResult> {
  const history = (input.transcript ?? [])
    .slice(-8)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `You are DealerVoice Inbox Setup Assistant helping "${input.dealershipName}" connect customer email.
Current step: ${input.step}
Detected provider hint: ${input.provider ?? "unknown"}

Support Gmail, Microsoft 365, generic IMAP, and email forwarding setups.
Ask one clear question at a time. Provide concrete steps when relevant.
If setup appears complete, set nextStep to "verify" and markComplete true.

Return JSON only:
{
  "reply": string,
  "nextStep": string,
  "suggestedProvider": "GMAIL"|"MICROSOFT"|"IMAP"|"FORWARDING"|"OTHER"|null,
  "connectionConfig": object|null,
  "markComplete": boolean
}

Conversation:
${history}
user: ${input.userMessage}`;

  try {
    const raw = await callAI(prompt, true);
    const parsed = JSON.parse(raw) as {
      reply?: string;
      nextStep?: string;
      suggestedProvider?: string | null;
      connectionConfig?: Record<string, unknown> | null;
      markComplete?: boolean;
    };

    const suggestedProvider = normalizeInboxProvider(parsed.suggestedProvider);

    if (parsed.reply?.trim()) {
      return {
        reply: parsed.reply.trim(),
        nextStep: parsed.nextStep?.trim() || input.step,
        suggestedProvider,
        connectionConfig: parsed.connectionConfig ?? null,
        markComplete: Boolean(parsed.markComplete),
      };
    }
  } catch (e) {
    console.error("Inbox onboarding AI error:", e);
  }

  return runOnboardingFallback({
    step: input.step,
    userMessage: input.userMessage,
  });
}
