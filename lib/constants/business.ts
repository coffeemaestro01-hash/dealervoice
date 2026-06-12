/** Legal entity details for payment-gateway KYC and public compliance pages. Set in Vercel env. */
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";

export const BUSINESS = {
  legalName: process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME || "DealerVoice",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || WHATSAPP_BUSINESS.display,
  whatsapp: WHATSAPP_BUSINESS.display,
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  city: process.env.NEXT_PUBLIC_BUSINESS_CITY || "Chicago",
  state: process.env.NEXT_PUBLIC_BUSINESS_STATE || "Illinois",
  country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "United States",
  gstin: process.env.NEXT_PUBLIC_BUSINESS_GSTIN || "",
  cin: process.env.NEXT_PUBLIC_BUSINESS_CIN || "",
} as const;

export function businessAddressLine(): string {
  return [BUSINESS.address, `${BUSINESS.city}, ${BUSINESS.state}`, BUSINESS.country]
    .filter(Boolean)
    .join(", ");
}

export function businessPhoneHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_BUSINESS_PHONE || WHATSAPP_BUSINESS.e164;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const e164 = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${e164}`;
}
