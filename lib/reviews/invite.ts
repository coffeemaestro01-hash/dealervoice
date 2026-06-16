import { APP_URL } from "@/lib/constants/emails";

/** Public profile with write-review intent highlighted */
export function dealerReviewInviteUrl(slug: string) {
  return `${APP_URL}/dealership/${slug}?write=1`;
}

/** Direct write-review flow (requires sign-in) */
export function dealerWriteReviewUrl(dealershipId: string) {
  return `${APP_URL}/write-review/${dealershipId}`;
}

/** Printable counter card with QR code */
export function dealerReviewInvitePrintUrl(slug: string) {
  return `${APP_URL}/dealership/${slug}/review-invite`;
}

export function reviewInviteQrApiUrl(slug: string) {
  return `${APP_URL}/api/reviews/invite-qr?slug=${encodeURIComponent(slug)}`;
}

export function buildReviewInviteSms(dealerName: string, slug: string) {
  return `Thanks for choosing ${dealerName}! Share your experience in 2 min: ${dealerReviewInviteUrl(slug)} — DealerVoice`;
}

export function buildReviewInviteEmailText(dealerName: string, slug: string) {
  return `Hi,

Thank you for visiting ${dealerName}. Would you take two minutes to share your experience? Your review helps other car buyers in Chicago.

${dealerReviewInviteUrl(slug)}

— ${dealerName} via DealerVoice`;
}
