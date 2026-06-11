/** Legal entity details for payment-gateway KYC and public compliance pages. Set in Vercel env. */
export const BUSINESS = {
  legalName: process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME || "DealerVoice",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  city: process.env.NEXT_PUBLIC_BUSINESS_CITY || "Ahmedabad",
  state: process.env.NEXT_PUBLIC_BUSINESS_STATE || "Gujarat",
  country: "India",
  gstin: process.env.NEXT_PUBLIC_BUSINESS_GSTIN || "",
  cin: process.env.NEXT_PUBLIC_BUSINESS_CIN || "",
} as const;

export function businessAddressLine(): string {
  return [BUSINESS.address, `${BUSINESS.city}, ${BUSINESS.state}`, BUSINESS.country]
    .filter(Boolean)
    .join(", ");
}

export function businessPhoneHref(): string | null {
  if (!BUSINESS.phone) return null;
  const digits = BUSINESS.phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.startsWith("91") ? digits : `91${digits}`}` : null;
}
