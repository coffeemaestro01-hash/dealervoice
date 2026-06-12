import { Resend } from "resend";
import { EMAILS } from "@/lib/constants/emails";
import {
  buildDripEmail,
  type DealerOutreachContext,
  type DripStep,
  type OutreachMarket,
} from "@/lib/outreach/templates";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

const FROM =
  process.env.EMAIL_FROM ||
  (process.env.EMAIL_DOMAIN
    ? `DealerVoice <dealers@${process.env.EMAIL_DOMAIN}>`
    : `DealerVoice <${EMAILS.dealers}>`);

function bodyToHtml(body: string): string {
  return body
    .split("\n")
    .map((line) => {
      if (line.startsWith("http")) return `<p><a href="${line}">${line}</a></p>`;
      return `<p>${line || "&nbsp;"}</p>`;
    })
    .join("");
}

export async function sendDripEmail(
  email: string,
  ctx: DealerOutreachContext,
  step: DripStep,
  promoCode?: string
) {
  const { subject, body } = buildDripEmail(ctx, step, promoCode);
  return getResend().emails.send({
    from: FROM,
    to: email,
    reply_to: EMAILS.dealers,
    subject,
    text: body,
    html: `<div style="font-family:Inter,sans-serif;line-height:1.6;color:#111;max-width:560px">${bodyToHtml(body)}</div>`,
    tags: [{ name: "outreach_drip", value: `step_${step}` }],
  });
}

export function dealerOutreachContext(
  dealer: {
    name: string;
    slug: string;
    cityName: string | null;
    stateName: string | null;
    phone: string | null;
    website: string | null;
    country?: { code: string } | null;
  },
  market?: OutreachMarket
): DealerOutreachContext {
  const resolvedMarket =
    market ?? (dealer.country?.code === "IN" ? "IN" : "US");
  return {
    name: dealer.name,
    slug: dealer.slug,
    cityName: dealer.cityName,
    stateName: dealer.stateName,
    phone: dealer.phone,
    website: dealer.website,
    market: resolvedMarket,
  };
}

/** Days after previous step before sending the next drip email */
export const DRIP_STEP_DELAYS_DAYS: Record<1 | 2, number> = {
  1: 3,
  2: 4,
};
