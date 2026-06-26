import { Resend } from "resend";
import { EMAILS, PRIMARY_INBOX } from "@/lib/constants/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use a full EMAIL_FROM if provided; otherwise build noreply@<domain>.
// Falls back to Resend's shared test sender so email works before a
// custom domain is verified.
const FROM =
  process.env.EMAIL_FROM ||
  (process.env.EMAIL_DOMAIN
    ? `DealerVoice <noreply@${process.env.EMAIL_DOMAIN}>`
    : `DealerVoice <${EMAILS.noreply}>`);

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

export interface DigestStats {
  periodLabel: string;
  totalDealers: number;
  totalUsers: number;
  totalReviews: number;
  newUsers7d: number;
  newReviews7d: number;
  newLeads7d: number;
  pendingClaims: number;
  pendingReports: number;
  paidSubscriptions: number;
  revenueInr: number;
  topDealers: { name: string; rating: number; reviews: number; slug: string }[];
  recentClaims: { dealerName: string; by: string }[];
}

export async function sendWeeklyDigest(to: string, s: DigestStats) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const stat = (label: string, value: string | number, sub?: string) =>
    `<td style="padding:14px;background:#faf8f2;border:1px solid #eee;border-radius:10px;text-align:center;width:33%">
      <div style="font-size:26px;font-weight:800;color:#0a0a0a">${value}</div>
      <div style="font-size:12px;color:#777;margin-top:2px">${label}</div>
      ${sub ? `<div style="font-size:11px;color:#C9961E;font-weight:600;margin-top:2px">${sub}</div>` : ""}
    </td>`;
  const topRows = s.topDealers.map(
    (d) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0"><a href="${appUrl}/dealership/${d.slug}" style="color:#0a0a0a;text-decoration:none;font-weight:600">${d.name}</a></td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#C9961E;font-weight:700">${d.rating.toFixed(1)}★</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#777">${d.reviews} reviews</td></tr>`
  ).join("");
  const claimsRows = s.recentClaims.length
    ? s.recentClaims.map((c) => `<li style="margin-bottom:4px">${c.dealerName} - <span style="color:#777">by ${c.by}</span></li>`).join("")
    : `<li style="color:#777">No new claims this week</li>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `📊 DealerVoice weekly digest - ${s.periodLabel}`,
    html: emailTemplate({
      title: "Your weekly business digest",
      body: `<p style="color:#555">Here's how DealerVoice performed over the last 7 days.</p>
<table style="width:100%;border-collapse:separate;border-spacing:6px;margin:12px 0"><tr>
${stat("Total dealerships", s.totalDealers.toLocaleString())}
${stat("Total members", s.totalUsers.toLocaleString(), `+${s.newUsers7d} this week`)}
${stat("Published reviews", s.totalReviews.toLocaleString(), `+${s.newReviews7d} this week`)}
</tr><tr>
${stat("New leads", s.newLeads7d, "this week")}
${stat("Revenue", `$${s.revenueInr.toLocaleString()}`, `${s.paidSubscriptions} paid plans`)}
${stat("Needs your action", s.pendingClaims + s.pendingReports, `${s.pendingClaims} claims · ${s.pendingReports} reports`)}
</tr></table>
<h3 style="margin:24px 0 8px;color:#0a0a0a">🏆 Top-rated dealers</h3>
<table style="width:100%;border-collapse:collapse">${topRows || '<tr><td style="color:#777">No rated dealers yet</td></tr>'}</table>
<h3 style="margin:24px 0 8px;color:#0a0a0a">🔑 Recent claim requests</h3>
<ul style="padding-left:18px;color:#444">${claimsRows}</ul>
<p style="margin-top:24px"><a href="${appUrl}/dashboard/admin" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">Open admin dashboard</a></p>
<p style="color:#999;font-size:12px;margin-top:16px">You receive this because you're the DealerVoice administrator.</p>`,
    }),
  });
}

export async function sendDsrConfirmation(to: string, name: string, kind: string, slaDueAt: Date) {
  const labels: Record<string, string> = {
    access: "data access (export)",
    correction: "data correction",
    erasure: "account & data deletion",
    nominate: "nominee registration",
  };
  const label = labels[kind] ?? kind;
  const due = slaDueAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  return resend.emails.send({
    from: FROM,
    to,
    reply_to: PRIMARY_INBOX,
    subject: `We received your ${label} request`,
    html: emailTemplate({
      title: "Request received",
      body: `<p>Hi ${name},</p>
<p>We've received your <strong>${label}</strong> request.</p>
<p>We'll complete it by <strong>${due}</strong> (within 30 days). You can track it anytime under
<a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/privacy" style="color:#C9961E">Privacy &amp; Your Data</a>.</p>
<p>Questions? Reply here or email <a href="mailto:${PRIMARY_INBOX}" style="color:#C9961E">${PRIMARY_INBOX}</a>.</p>`,
    }),
  });
}

export async function sendAdminNotification(
  subject: string,
  htmlBody: string
) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || PRIMARY_INBOX;
  return resend.emails.send({
    from: FROM,
    to,
    reply_to: PRIMARY_INBOX,
    subject,
    html: emailTemplate({ title: subject, body: htmlBody }),
  });
}

export async function sendNewClaimNotification(
  dealerName: string,
  businessEmail: string,
  autoApproved: boolean,
  claimId: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  return sendAdminNotification(
    autoApproved ? `✅ Auto-approved claim: ${dealerName}` : `📋 New claim pending: ${dealerName}`,
    `<p><strong>${dealerName}</strong> claim submitted by <a href="mailto:${businessEmail}">${businessEmail}</a>.</p>
<p>Status: <strong>${autoApproved ? "AUTO-APPROVED" : "PENDING REVIEW"}</strong></p>
<p><a href="${appUrl}/dashboard/admin/claims" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Review in admin</a></p>
<p style="color:#999;font-size:12px">Claim ID: ${claimId}</p>`
  );
}

export async function sendNewLeadNotification(
  to: string,
  dealerName: string,
  lead: { name: string; email: string; phone?: string | null; vehicle?: string | null; message?: string | null; type: string }
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/dealer/leads`;
  const body = `<p><strong>${lead.name}</strong> submitted a request on your DealerVoice profile.</p>
<ul style="padding-left:18px;color:#444">
<li>Email: ${lead.email}</li>
${lead.phone ? `<li>Phone: ${lead.phone}</li>` : ""}
${lead.vehicle ? `<li>Vehicle: ${lead.vehicle}</li>` : ""}
${lead.message ? `<li>Message: ${lead.message}</li>` : ""}
</ul>
<p><a href="${url}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View in Dashboard</a></p>`;

  await sendAdminNotification(
    `💰 New lead: ${dealerName} — ${lead.name}`,
    `<p>New lead on <strong>${dealerName}</strong>.</p>${body}`
  ).catch(() => {});

  return resend.emails.send({
    from: FROM,
    to,
    subject: `New ${lead.type.toLowerCase()} lead for ${dealerName}`,
    html: emailTemplate({ title: "New Customer Lead", body }),
  });
}

export async function sendClaimDocumentsRequiredEmail(
  to: string,
  name: string,
  dealerName: string,
  message: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  return resend.emails.send({
    from: FROM,
    to,
    subject: `More documents needed for your ${dealerName} claim`,
    html: emailTemplate({
      title: "Additional Documents Required",
      body: `<p>Hi ${name},</p>
<p>We're reviewing your claim for <strong>${dealerName}</strong> and need more information before we can approve it.</p>
<p style="background:#f9fafb;border-left:4px solid #C9961E;padding:12px 16px;margin:16px 0">${message}</p>
<p>Please upload the requested documents and resubmit from your dealership profile.</p>
<p><a href="${appUrl}/dashboard/dealer" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Go to Dashboard</a></p>`,
    }),
  });
}

export async function sendSubscriptionWelcomeEmail(
  to: string,
  params: {
    name: string;
    dealerName: string;
    dealerSlug: string;
    plan: "PRO" | "PRO_PLUS" | "ENTERPRISE";
    interval: "monthly" | "annual";
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const planLabel =
    params.plan === "ENTERPRISE" ? "Enterprise" : params.plan === "PRO_PLUS" ? "Pro+" : "Pro";
  const billingLabel = params.interval === "annual" ? "annual" : "monthly";
  const dashboardUrl = `${appUrl}/dashboard/dealer`;
  const settingsUrl = `${appUrl}/dashboard/dealer/settings`;
  const analyticsUrl = `${appUrl}/dashboard/dealer/analytics`;
  const reviewUrl = `${appUrl}/dealership/${params.dealerSlug}?write=1`;

  const proSteps = [
    "Complete your dealership profile so buyers trust what they see.",
    "Share your review invite link with recent customers.",
    "Check analytics to see how your reputation compares locally.",
    "Use AI response suggestions when new reviews come in.",
  ];
  const enterpriseSteps = [
    ...proSteps,
    "Explore API access and white-label reports in your dashboard.",
  ];
  const steps = params.plan === "ENTERPRISE" ? enterpriseSteps : proSteps;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to DealerVoice ${planLabel}!`,
    html: emailTemplate({
      title: `You're on ${planLabel}`,
      body: `<p>Hi ${params.name},</p>
<p>Thank you for subscribing — <strong>${params.dealerName}</strong> is now on DealerVoice <strong>${planLabel}</strong> (${billingLabel} billing).</p>
<p style="margin:20px 0"><strong>Your quick-start checklist:</strong></p>
<ol style="padding-left:20px;color:#444;line-height:1.8">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
<p><a href="${dashboardUrl}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;margin-right:8px">Open dashboard</a>
<a href="${settingsUrl}" style="background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Complete profile</a></p>
<p style="margin-top:20px"><strong>Collect verified reviews:</strong></p>
<p style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px 16px;border-radius:8px;word-break:break-all;font-size:13px">${reviewUrl}</p>
<p style="margin-top:16px"><a href="${analyticsUrl}" style="color:#C9961E">View analytics →</a></p>
<p style="color:#777;font-size:14px;margin-top:24px">Questions? Reply to this email or contact <a href="mailto:${EMAILS.support}" style="color:#C9961E">${EMAILS.support}</a>.</p>
<p style="color:#999;font-size:12px">Built in Chicago. Available worldwide.</p>`,
    }),
  });
}

export async function sendDealerReviewGrowthEmail(to: string, dealerName: string, inviteUrl: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const dashboardUrl = `${appUrl}/dashboard/dealer`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${dealerName} — get your first 10 reviews on DealerVoice`,
    html: emailTemplate({
      title: "Grow your reputation",
      body: `<p>Hi,</p>
<p><strong>${dealerName}</strong> is claimed on DealerVoice but has no published reviews yet. Buyers trust dealers with verified feedback — stores with 10+ reviews convert 3× more profile views into leads.</p>
<p><strong>Share this link</strong> after every sale or service visit (SMS, email, receipt):</p>
<p style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px 16px;border-radius:8px;word-break:break-all;font-size:13px"><a href="${inviteUrl}" style="color:#C9961E">${inviteUrl}</a></p>
<p><a href="${dashboardUrl}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Open dealer dashboard</a></p>
<p style="color:#777;font-size:14px;margin-top:20px">Your dashboard has QR codes, SMS templates, and featured badge embeds for Pro members.</p>`,
    }),
  });
}

export async function sendClaimApprovedEmail(
  to: string,
  name: string,
  dealerName: string,
  dealerSlug?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io";
  const dashboardUrl = `${appUrl}/dashboard/dealer`;
  const inviteUrl = dealerSlug
    ? `${appUrl}/dealership/${dealerSlug}?write=1`
    : `${appUrl}/write-review`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your claim for ${dealerName} has been approved`,
    html: emailTemplate({
      title: "Claim Approved!",
      body: `<p>Hi ${name},</p>
<p>Your ownership claim for <strong>${dealerName}</strong> has been approved. You can now manage your dealership profile.</p>
<p><strong>Grow your reputation:</strong> Share this link with customers to collect verified reviews:</p>
<p style="background:#f9fafb;border:1px solid #e5e7eb;padding:12px 16px;border-radius:8px;word-break:break-all;font-size:13px">${inviteUrl}</p>
<p><a href="${dashboardUrl}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-right:8px">Go to Dashboard</a>
<a href="${inviteUrl}" style="background:#C9961E;color:#0a0a0a;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Copy review invite link</a></p>`,
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
