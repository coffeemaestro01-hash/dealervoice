import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use a full EMAIL_FROM if provided; otherwise build noreply@<domain>.
// Falls back to Resend's shared test sender so email works before a
// custom domain is verified.
const FROM =
  process.env.EMAIL_FROM ||
  (process.env.EMAIL_DOMAIN
    ? `DealerVoice <noreply@${process.env.EMAIL_DOMAIN}>`
    : "DealerVoice <onboarding@resend.dev>");

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your DealerVoice account",
    html: emailTemplate({
      title: "Verify Your Email",
      body: `<p>Hi ${name},</p>
<p>Please verify your email address to complete your registration.</p>
<p><a href="${url}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Verify Email</a></p>
<p>This link expires in 24 hours.</p>`,
    }),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your DealerVoice password",
    html: emailTemplate({
      title: "Reset Your Password",
      body: `<p>Hi ${name},</p>
<p>You requested a password reset. Click below to choose a new password.</p>
<p><a href="${url}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a></p>
<p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
    }),
  });
}

export async function sendNewReviewNotification(to: string, dealerName: string, rating: number, reviewId: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/dealer/reviews/${reviewId}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `New ${rating}-star review for ${dealerName}`,
    html: emailTemplate({
      title: "New Review Received",
      body: `<p>Your dealership <strong>${dealerName}</strong> received a new ${rating}-star review.</p>
<p><a href="${url}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View & Respond</a></p>
<p>Responding to reviews improves your reputation score.</p>`,
    }),
  });
}

export async function sendClaimApprovedEmail(to: string, name: string, dealerName: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/dealer`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your claim for ${dealerName} has been approved`,
    html: emailTemplate({
      title: "Claim Approved!",
      body: `<p>Hi ${name},</p>
<p>Your ownership claim for <strong>${dealerName}</strong> has been approved. You can now manage your dealership profile.</p>
<p><a href="${url}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Go to Dashboard</a></p>`,
    }),
  });
}

function emailTemplate({ title, body }: { title: string; body: string }): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.header{background:#0a0a0a;padding:24px;text-align:center}
.header h1{color:#D4AF37;margin:0;font-size:24px;letter-spacing:-0.5px}
.body{padding:32px;color:#374151;line-height:1.6}
.footer{background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af}
</style></head>
<body><div class="container">
<div class="header"><h1>DealerVoice</h1></div>
<div class="body"><h2>${title}</h2>${body}</div>
<div class="footer"><p>© ${new Date().getFullYear()} DealerVoice. All rights reserved.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#6b7280">Privacy Policy</a> ·
<a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#6b7280">Unsubscribe</a></p></div>
</div></body></html>`;
}
