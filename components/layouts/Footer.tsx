import Link from "next/link";
import { FooterBrand } from "@/components/common/Logo";
import { SocialLinks } from "@/components/common/SocialLinks";
import { ManageCookiesLink } from "@/components/consent/ManageCookiesLink";
import { EMAILS } from "@/lib/constants/emails";

const FOOTER_LINKS = {
  Platform: [
    { label: "Find Dealers", href: "/dealers" },
    { label: "Write a Review", href: "/dealers?intent=write" },
    { label: "How It Works", href: "/about" },
    { label: "Methodology", href: "/methodology" },
    { label: "Pricing", href: "/pricing" },
  ],
  Business: [
    { label: "Claim Your Dealership", href: "/claim" },
    { label: "Dealer Dashboard", href: "/dashboard/dealer" },
    { label: "Advertise", href: "/advertise" },
    { label: "API Access", href: "/api-docs" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Grievance Redressal", href: "/grievance" },
    { label: "Cancellations & Refunds", href: "/shipping-refunds" },
    { label: "BIS Compliance", href: "/bis-compliance" },
    { label: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-night-900 text-gray-400 mt-auto border-t border-gold/20">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <FooterBrand height={32} />
            <p className="text-sm leading-relaxed mt-3">
              A global platform for car dealership reviews and reputation insights — built for car buyers and dealerships.
            </p>
            <a
              href={`mailto:${EMAILS.outreach}`}
              className="text-sm text-gold-400 hover:text-gold-300 mt-2 inline-block"
            >
              {EMAILS.outreach}
            </a>
            <SocialLinks className="mt-4" />
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-gold-400 font-semibold text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-gold-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gold/15 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} DealerVoice. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <ManageCookiesLink />
            <span>Dealership listings across multiple countries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
