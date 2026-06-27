import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { SocialLinks } from "@/components/common/SocialLinks";
import { ManageCookiesLink } from "@/components/consent/ManageCookiesLink";
import { COMPANY } from "@/lib/constants/company";

const FOOTER_LINKS = {
  "For buyers": [
    { label: "Overview", href: "/buyers" },
    { label: "Find Dealers", href: "/dealers" },
    { label: "Explore", href: "/explore" },
    { label: "Write a Review", href: "/write-review" },
    { label: "Trust & Scores", href: "/trust" },
    { label: "Methodology", href: "/methodology" },
    { label: "Chicago", href: "/chicago" },
  ],
  "For dealers": [
    { label: "Dealer Solutions", href: "/for-dealers" },
    { label: "Claim Your Dealership", href: "/claim" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dealer Dashboard", href: "/dashboard/dealer" },
    { label: "Advertise", href: "/advertise" },
  ],
  Company: [
    { label: "Insights", href: "/insights" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Research", href: "/research" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Support & Grievances", href: "/grievance" },
    { label: "Cancellations & Refunds", href: "/shipping-refunds" },
    { label: "Review Standards", href: "/bis-compliance" },
    { label: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  return (
    <footer className="surface-panel text-muted-foreground mt-auto border-t border-border/60">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="full" height={32} inverted />
            <p className="text-sm leading-relaxed mt-3">
              A global platform for car dealership reviews and reputation insights — {COMPANY.tagline.toLowerCase()}
            </p>
            <SocialLinks className="mt-4" />
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-primary font-semibold text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <div>
            <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
            <p className="text-muted-foreground mt-1">{COMPANY.tagline}</p>
          </div>
          <div className="flex items-center gap-4">
            <ManageCookiesLink />
            <span>Dealership listings worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
