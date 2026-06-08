import { APP_URL, EMAILS } from "@/lib/constants/emails";

export interface DealerOutreachContext {
  name: string;
  slug: string;
  cityName?: string | null;
  stateName?: string | null;
  phone?: string | null;
  website?: string | null;
}

export function claimUrl(slug: string) {
  return `${APP_URL}/claim?dealer=${slug}`;
}

export function profileUrl(slug: string) {
  return `${APP_URL}/dealership/${slug}`;
}

export function reviewInviteUrl(slug: string) {
  return `${APP_URL}/dealership/${slug}?write=1`;
}

export function buildClaimEmail(ctx: DealerOutreachContext) {
  const location = [ctx.cityName, ctx.stateName].filter(Boolean).join(", ");
  return {
    subject: `${ctx.name} — claim your free DealerVoice profile`,
    body: `Hi,

Your dealership${location ? ` in ${location}` : ""} is listed on DealerVoice — India's dealership review platform.

Claim your profile (free) to:
• Respond to customer reviews
• Share a review invite link with buyers
• Update contact details and hours

Claim here: ${claimUrl(ctx.slug)}

Your listing: ${profileUrl(ctx.slug)}

Questions? Reply or email ${EMAILS.dealers}

— DealerVoice Team
${EMAILS.dealers}`,
  };
}

export function buildReviewInviteEmail(ctx: DealerOutreachContext) {
  return {
    subject: `Ask customers to review ${ctx.name} on DealerVoice`,
    body: `Hi,

Share this link with recent buyers — verified reviews build trust in ${[ctx.cityName, ctx.stateName].filter(Boolean).join(", ") || "your market"}:

${reviewInviteUrl(ctx.slug)}

Your public profile: ${profileUrl(ctx.slug)}

— DealerVoice
${EMAILS.dealers}`,
  };
}

export function buildWhatsAppClaim(ctx: DealerOutreachContext) {
  return `Hi, this is DealerVoice. ${ctx.name} is listed on our India dealership review platform. Claim your free profile here: ${claimUrl(ctx.slug)} — respond to reviews & share a review link with customers. Questions: ${EMAILS.dealers}`;
}

export function buildPhoneScript(ctx: DealerOutreachContext) {
  return [
    `Opening: "Hi, I'm calling from DealerVoice — we list car dealerships across India with verified buyer reviews."`,
    `Hook: "${ctx.name} is already on our site at ${profileUrl(ctx.slug)}"`,
    `Ask: "Are you the owner or manager? We offer a free profile claim so you can respond to reviews."`,
    `Close: "I can text you the claim link, or visit ${claimUrl(ctx.slug)}"`,
    `Follow-up email: ${EMAILS.dealers}`,
  ].join("\n\n");
}

export function whatsappHref(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
