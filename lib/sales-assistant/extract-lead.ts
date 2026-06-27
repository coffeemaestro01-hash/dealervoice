const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;

export type ExtractedLead = {
  name?: string;
  email?: string;
  phone?: string;
  vehicle?: string;
  message?: string;
  type: "QUOTE" | "TEST_DRIVE" | "GENERAL";
};

export function extractLeadFromConversation(
  messages: Array<{ role: string; content: string }>
): ExtractedLead | null {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const allText = messages.map((m) => m.content).join("\n");

  const email = userText.match(EMAIL_RE)?.[0];
  if (!email) return null;

  const phone = userText.match(PHONE_RE)?.[0]?.replace(/\s+/g, " ").trim();

  let name: string | undefined;
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+[\w.+-]+@/m,
  ];
  for (const re of namePatterns) {
    const m = userText.match(re);
    if (m?.[1]) {
      name = m[1].trim();
      break;
    }
  }

  let vehicle: string | undefined;
  const vehicleMatch = userText.match(
    /(?:interested in|looking for|want a|need a)\s+(?:the\s+)?([\w\s-]{3,40}(?:suv|sedan|truck|ev|hybrid|camry|f-150|model\s?\w)?)/i
  );
  if (vehicleMatch?.[1]) vehicle = vehicleMatch[1].trim().slice(0, 120);

  const lower = userText.toLowerCase();
  const type = lower.includes("test drive") || lower.includes("test-drive")
    ? "TEST_DRIVE"
    : lower.includes("quote") || lower.includes("price") || lower.includes("financ")
      ? "QUOTE"
      : "GENERAL";

  return {
    name: name ?? "Website visitor",
    email,
    phone,
    vehicle,
    message: allText.slice(0, 2000),
    type,
  };
}
