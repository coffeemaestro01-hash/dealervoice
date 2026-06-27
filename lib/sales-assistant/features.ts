import type { SubscriptionPlan } from "@prisma/client";

export type SalesAssistantTier = "none" | "basic" | "full" | "enterprise";

export type SalesAssistantFeatures = {
  tier: SalesAssistantTier;
  enabled: boolean;
  /** 24/7 chat widget on DealerVoice profile */
  profileWidget: boolean;
  /** Capture name, email, phone into Leads */
  leadCapture: boolean;
  /** Collect preferred visit / test-drive times */
  appointmentBooking: boolean;
  /** Auto email follow-up to warm leads (24h) */
  automatedFollowUp: boolean;
  /** Embed script for dealer website */
  websiteEmbed: boolean;
  /** Custom greeting & assistant name */
  customGreeting: boolean;
};

const NONE: SalesAssistantFeatures = {
  tier: "none",
  enabled: false,
  profileWidget: false,
  leadCapture: false,
  appointmentBooking: false,
  automatedFollowUp: false,
  websiteEmbed: false,
  customGreeting: false,
};

export function getSalesAssistantFeatures(
  plan: SubscriptionPlan,
  status?: string | null
): SalesAssistantFeatures {
  const active = !status || status === "ACTIVE" || status === "TRIALING";
  if (!active || plan === "FREE") return NONE;

  if (plan === "PRO") {
    return {
      tier: "basic",
      enabled: true,
      profileWidget: true,
      leadCapture: true,
      appointmentBooking: false,
      automatedFollowUp: false,
      websiteEmbed: false,
      customGreeting: false,
    };
  }

  if (plan === "PRO_PLUS") {
    return {
      tier: "full",
      enabled: true,
      profileWidget: true,
      leadCapture: true,
      appointmentBooking: true,
      automatedFollowUp: true,
      websiteEmbed: false,
      customGreeting: true,
    };
  }

  return {
    tier: "enterprise",
    enabled: true,
    profileWidget: true,
    leadCapture: true,
    appointmentBooking: true,
    automatedFollowUp: true,
    websiteEmbed: true,
    customGreeting: true,
  };
}

export const SALES_ASSISTANT_PLAN_COPY: Record<
  Exclude<SalesAssistantTier, "none">,
  string[]
> = {
  basic: [
    "AI sales assistant on your profile (24/7)",
    "Instant replies to buyer questions",
    "Auto lead capture to your dashboard",
  ],
  full: [
    "Everything in Pro assistant",
    "Appointment & test-drive scheduling",
    "Automated lead follow-up emails",
    "Custom greeting & assistant name",
  ],
  enterprise: [
    "Everything in Pro+ assistant",
    "Website embed widget",
    "CRM-ready lead routing",
  ],
};
