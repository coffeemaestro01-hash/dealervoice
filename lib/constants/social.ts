/** Official DealerVoice social profiles */
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/share/1DDekYU41u/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/dealervoice_io?igsh=MTR0cXdrdnc0MHdxYQ%3D%3D&utm_source=qr",
  linkedin: "https://www.linkedin.com/company/dealervoice/",
} as const;

/** DealerVoice WhatsApp Business (US) */
export const WHATSAPP_BUSINESS = {
  e164: "18723470915",
  display: "+1 (872) 347-0915",
  href: "https://wa.me/18723470915",
} as const;

export function whatsappBusinessHref(message?: string): string {
  if (!message) return WHATSAPP_BUSINESS.href;
  return `${WHATSAPP_BUSINESS.href}?text=${encodeURIComponent(message)}`;
}

export const SOCIAL_HANDLES = {
  instagram: "@dealervoice_io",
  linkedin: "DealerVoice",
} as const;

/** Contact email for social media profile bios only — not used on the website */
export const SOCIAL_CONTACT_EMAIL = "outreach@dealervoice.io";
