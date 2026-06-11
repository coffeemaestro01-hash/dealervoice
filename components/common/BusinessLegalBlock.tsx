import { Mail, MapPin, Phone } from "lucide-react";
import { BUSINESS, businessAddressLine, businessPhoneHref } from "@/lib/constants/business";
import { EMAILS } from "@/lib/constants/emails";

interface Props {
  compact?: boolean;
}

/** Legal name, address, phone — required by Indian PG KYC website checks. */
export function BusinessLegalBlock({ compact }: Props) {
  const phoneHref = businessPhoneHref();
  const address = businessAddressLine();

  return (
    <div className={compact ? "text-sm space-y-1" : "space-y-2 text-gray-700"}>
      <p>
        <strong>Legal name:</strong> {BUSINESS.legalName}
      </p>
      {address && (
        <p className="inline-flex items-start gap-1.5">
          <MapPin size={14} className="shrink-0 mt-0.5 text-gold-600" />
          <span>{address}</span>
        </p>
      )}
      {BUSINESS.phone && phoneHref && (
        <p>
          <a href={phoneHref} className="inline-flex items-center gap-1.5 text-gold-700 hover:underline font-medium">
            <Phone size={14} /> {BUSINESS.phone}
          </a>
        </p>
      )}
      {!compact && (
        <p>
          <a href={`mailto:${EMAILS.support}`} className="inline-flex items-center gap-1.5 text-gold-700 hover:underline">
            <Mail size={14} /> {EMAILS.support}
          </a>
        </p>
      )}
      {BUSINESS.gstin && <p className="text-sm text-gray-600">GSTIN: {BUSINESS.gstin}</p>}
      {BUSINESS.cin && <p className="text-sm text-gray-600">CIN: {BUSINESS.cin}</p>}
    </div>
  );
}
