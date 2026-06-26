import { APP_URL, EMAILS } from "@/lib/constants/emails";
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";
import { dealerReviewInviteUrl } from "@/lib/reviews/invite";

export type OutreachMarket = "US";

export interface DealerOutreachContext {
  name: string;
  slug: string;
  cityName?: string | null;
  stateName?: string | null;
  phone?: string | null;
  website?: string | null;
  market?: OutreachMarket;
}

function marketOf(_ctx: DealerOutreachContext): OutreachMarket {
  return "US";
}

function platformLabel(_market: OutreachMarket): string {
  return "a car dealership review platform built in Chicago, trusted by buyers nationwide";
}

export function claimUrl(slug: string) {
  return `${APP_URL}/claim?dealer=${slug}`;
}

export function profileUrl(slug: string) {
  return `${APP_URL}/dealership/${slug}`;
}

export function reviewInviteUrl(slug: string) {
  return dealerReviewInviteUrl(slug);
}

export function billingUrl() {
  return `${APP_URL}/dashboard/dealer/billing`;
}

export function buildClaimEmail(ctx: DealerOutreachContext) {
  const market = marketOf(ctx);
  const location = [ctx.cityName, ctx.stateName].filter(Boolean).join(", ");
  return {
    subject: `${ctx.name} — claim your free DealerVoice profile`,
    body: `Hi,

Your dealership${location ? ` in ${location}` : ""} is listed on DealerVoice — ${platformLabel(market)}.

Claim your profile (free) to:
• Respond to customer reviews
• Share a review invite link with buyers
• Update contact details and hours

Claim here: ${claimUrl(ctx.slug)}

Your listing: ${profileUrl(ctx.slug)}

Questions? Reply, email ${EMAILS.dealers}, or WhatsApp ${WHATSAPP_BUSINESS.display}

— DealerVoice Team
${EMAILS.dealers}`,
  };
}

export function buildReviewInviteEmail(ctx: DealerOutreachContext) {
  const location = [ctx.cityName, ctx.stateName].filter(Boolean).join(", ") || "your market";
  return {
    subject: `Ask customers to review ${ctx.name} on DealerVoice`,
    body: `Hi,

Share this link with recent buyers — verified reviews build trust in ${location}:

${reviewInviteUrl(ctx.slug)}

Your public profile: ${profileUrl(ctx.slug)}

— DealerVoice
${EMAILS.dealers}`,
  };
}

export function buildWhatsAppClaim(ctx: DealerOutreachContext) {
  return `Hi, this is DealerVoice. ${ctx.name} is listed on our U.S. dealership review platform. Claim your free profile here: ${claimUrl(ctx.slug)} — respond to reviews & share a review link with customers. Questions: ${EMAILS.dealers} or WhatsApp ${WHATSAPP_BUSINESS.display}`;
}

export function buildPhoneScript(ctx: DealerOutreachContext) {
  return [
    `Opening: "Hi, I'm calling from DealerVoice — we list car dealerships across the United States with verified buyer reviews."`,
    `Hook: "${ctx.name} is already on our site at ${profileUrl(ctx.slug)}"`,
    `Ask: "Are you the owner or manager? We offer a free profile claim so you can respond to reviews."`,
    `Close: "I can text you the claim link, or visit ${claimUrl(ctx.slug)}"`,
    `WhatsApp us: ${WHATSAPP_BUSINESS.display}`,
    `Follow-up email: ${EMAILS.dealers}`,
  ].join("\n\n");
}

export function whatsappHref(phone: string, message: string, _market: OutreachMarket = "US") {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.startsWith("1") && digits.length === 11 ? digits : `1${digits.replace(/^1/, "")}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export type DripStep = 1 | 2 | 3;

export function buildDripEmail(ctx: DealerOutreachContext, step: DripStep, promoCode?: string) {
  const location = [ctx.cityName, ctx.stateName].filter(Boolean).join(", ");
  const market = marketOf(ctx);

  if (step === 1) {
    return {
      subject: `${ctx.name} is on DealerVoice — claim your free profile`,
      body: `Hi,

We wanted to let you know that ${ctx.name}${location ? ` in ${location}` : ""} is already listed on DealerVoice.

Car buyers use DealerVoice to compare dealerships, read reviews, and request quotes before they visit the lot. Your profile is live here:

${profileUrl(ctx.slug)}

Claiming is free and takes about two minutes. Once claimed, you can respond to reviews and share a review invite link with customers.

Claim your profile: ${claimUrl(ctx.slug)}

Questions? WhatsApp ${WHATSAPP_BUSINESS.display} or email ${EMAILS.dealers}

— DealerVoice
${EMAILS.dealers}`,
    };
  }

  if (step === 2) {
    const localHook =
      market === "US" && location
        ? `Buyers in ${location} are searching for transparent, well-reviewed dealers.`
        : "Buyers in your market are searching for transparent, well-reviewed dealers.";
    return {
      subject: `Buyers are comparing dealers near ${ctx.cityName ?? ctx.name}`,
      body: `Hi,

Quick follow-up about your DealerVoice listing for ${ctx.name}.

${localHook} Dealers who claim their profile and collect reviews typically see more qualified leads — because buyers trust stores that respond publicly.

Your listing: ${profileUrl(ctx.slug)}
Claim (free): ${claimUrl(ctx.slug)}

If you have questions, reply to this email or WhatsApp ${WHATSAPP_BUSINESS.display}.

— DealerVoice
${EMAILS.dealers}`,
    };
  }

  const codeLine = promoCode
    ? `Use code ${promoCode} at checkout for Pro at $1/month (normally $199/month). This code is exclusive to ${ctx.name}.`
    : "Reply for pilot pricing — Pro $199/mo or Pro+ $349/mo with featured badge & review backlink on your website.";

  return {
    subject: `Pilot offer for ${ctx.name} — Pro from $1/month`,
    body: `Hi,

Last note from us about ${ctx.name} on DealerVoice.

Pro ($199/mo) unlocks review invite tools, analytics, and competitor monitoring. Pro+ ($349/mo) adds a featured badge and embeddable review backlink for your website — buyers land directly on your profile to write a review.

${codeLine}

1. Claim your profile: ${claimUrl(ctx.slug)}
2. Upgrade at billing: ${billingUrl()}

Questions? ${EMAILS.dealers} · WhatsApp ${WHATSAPP_BUSINESS.display}

— DealerVoice
Built in Chicago · Available nationwide`,
  };
}
