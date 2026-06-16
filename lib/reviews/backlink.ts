import { APP_URL } from "@/lib/constants/emails";
import { dealerReviewInviteUrl } from "@/lib/reviews/invite";
import type { PaidPlan } from "@/lib/dealer/featured-badge";

const BADGE_COLORS: Record<PaidPlan, { bg: string; border: string; text: string; label: string }> = {
  PRO: { bg: "#F5F0E6", border: "#C9961E", text: "#5C4A1E", label: "Featured Pro Dealer" },
  PRO_PLUS: { bg: "#FFF8EB", border: "#B8860B", text: "#3D2E0A", label: "Featured Pro+ Dealer" },
  ENTERPRISE: { bg: "#EDE4D3", border: "#8B6914", text: "#1A1408", label: "Featured Enterprise Dealer" },
};

/** Plain review invite URL with write intent */
export function dealerBacklinkUrl(slug: string) {
  return dealerReviewInviteUrl(slug);
}

/** Inline HTML badge linking to the dealer's write-review profile */
export function buildFeaturedBadgeEmbedHtml(slug: string, dealerName: string, plan: PaidPlan) {
  const url = dealerBacklinkUrl(slug);
  const style = BADGE_COLORS[plan];
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="Review ${dealerName} on DealerVoice" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9999px;border:1px solid ${style.border};background:${style.bg};color:${style.text};font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:600;text-decoration:none;line-height:1.2;">
  <span style="font-size:14px;">★</span> ${style.label}
</a>`;
}

/** Markdown link for email signatures and CMS */
export function buildFeaturedBadgeMarkdown(slug: string, dealerName: string) {
  const url = dealerBacklinkUrl(slug);
  return `[Review ${dealerName} on DealerVoice](${url})`;
}

/** Full HTML snippet with attribution for website footers */
export function buildFeaturedBadgeEmbedBlock(slug: string, dealerName: string, plan: PaidPlan) {
  const badge = buildFeaturedBadgeEmbedHtml(slug, dealerName, plan);
  return `${badge}\n<p style="margin:8px 0 0;font-family:system-ui,sans-serif;font-size:11px;color:#888;">Powered by <a href="${APP_URL}" style="color:#C9961E;">DealerVoice</a></p>`;
}
