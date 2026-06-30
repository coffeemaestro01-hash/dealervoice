import type { InboxEmailProvider } from "@prisma/client";
import { detectProviderFromText, normalizeInboxProvider } from "@/lib/inbox/normalize-provider";

export type OnboardingAssistantResult = {
  reply: string;
  nextStep: string;
  suggestedProvider: InboxEmailProvider | null;
  connectionConfig: Record<string, unknown> | null;
  markComplete: boolean;
};

export function runOnboardingFallback(input: {
  step: string;
  userMessage: string;
  aiSuggestedProvider?: string | null;
}): OnboardingAssistantResult {
  const detected =
    normalizeInboxProvider(input.aiSuggestedProvider) ?? detectProviderFromText(input.userMessage);
  const msg = input.userMessage.toLowerCase();

  if (detected === "MICROSOFT") {
    return {
      reply: `Great — Microsoft 365 is a solid choice. Here is the usual setup path:

1. Pick the shared mailbox or alias customers email (for example service@yourdealership.com).
2. In Microsoft 365 admin, create a dedicated user or shared mailbox for support if you do not have one yet.
3. Enable IMAP/SMTP or set up a forward rule to your DealerVoice Inbox ingest address once we provide it in Settings.
4. Send a test message to that address and confirm it appears in your Inbox ticket list.

What is the exact support email address customers use today? (e.g. service@yourstore.com)`,
      nextStep: "microsoft_address",
      suggestedProvider: "MICROSOFT",
      connectionConfig: { setup: "microsoft365", stage: "collect_address" },
      markComplete: false,
    };
  }

  if (detected === "GMAIL") {
    return {
      reply: `Perfect — for Gmail or Google Workspace we will connect via Google OAuth from Settings, or you can forward customer mail to your ingest address.

What is the support email customers write to today?`,
      nextStep: "gmail_address",
      suggestedProvider: "GMAIL",
      connectionConfig: { setup: "gmail", stage: "collect_address" },
      markComplete: false,
    };
  }

  if (detected === "FORWARDING") {
    return {
      reply: `Forwarding works well. You will create a rule in your current email host to forward customer messages to the ingest address shown in Settings.

What email address do customers contact today?`,
      nextStep: "forwarding_address",
      suggestedProvider: "FORWARDING",
      connectionConfig: { setup: "forwarding", stage: "collect_address" },
      markComplete: false,
    };
  }

  if (detected === "IMAP") {
    return {
      reply: `We can connect generic IMAP/SMTP mail — you will need your server host, username, and an app password from your email provider.

What is your support email address and who hosts it (GoDaddy, Rackspace, etc.)?`,
      nextStep: "imap_details",
      suggestedProvider: "IMAP",
      connectionConfig: { setup: "imap", stage: "collect_details" },
      markComplete: false,
    };
  }

  if (/test|done|works|connected|verified/.test(msg)) {
    return {
      reply: `Excellent — if test messages are arriving in your Inbox, you are all set. Visit Settings anytime to update your connection. Need help with templates or inviting your team?`,
      nextStep: "complete",
      suggestedProvider: detected,
      connectionConfig: null,
      markComplete: true,
    };
  }

  if (/@/.test(input.userMessage)) {
    return {
      reply: `Got it — I saved ${input.userMessage.trim()} as your support address. Next, open Settings to finish connection details, then send a test email from another account to confirm tickets appear in Inbox.

Reply "test passed" when you see the ticket.`,
      nextStep: "verify",
      suggestedProvider: detected,
      connectionConfig: { supportAddress: input.userMessage.trim() },
      markComplete: false,
    };
  }

  return {
    reply:
      "Tell me which email system you use (Gmail, Microsoft 365, Outlook, IMAP, or forwarding) and the support address customers email today.",
    nextStep: input.step || "welcome",
    suggestedProvider: detected,
    connectionConfig: null,
    markComplete: false,
  };
}
