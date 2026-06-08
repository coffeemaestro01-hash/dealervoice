import { Resend } from "resend";
import { EMAILS } from "@/lib/constants/emails";
import { buildClaimEmail, type DealerOutreachContext } from "@/lib/outreach/templates";

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

export async function sendClaimOutreachEmail(email: string, ctx: DealerOutreachContext) {
  const { subject, body } = buildClaimEmail(ctx);
  const html = body
    .split("\n")
    .map((line) => (line.startsWith("http") ? `<p><a href="${line}">${line}</a></p>` : `<p>${line || "&nbsp;"}</p>`))
    .join("");

  return getResend().emails.send({
    from: FROM,
    to: email,
    reply_to: EMAILS.dealers,
    subject,
    text: body,
    html: `<div style="font-family:Inter,sans-serif;line-height:1.6;color:#111;max-width:560px">${html}</div>`,
  });
}
