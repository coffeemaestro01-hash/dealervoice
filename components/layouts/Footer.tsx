import Link from "next/link";
import { FooterBrand } from "@/components/common/Logo";
import { ManageCookiesLink } from "@/components/consent/ManageCookiesLink";

const FOOTER_LINKS = {
  Platform: [
    { label: "Book a Demo", href: "/demo" },
    { label: "ROI Calculator", href: "/#roi-calculator" },
    { label: "Pricing", href: "/pricing" },
    { label: "Find Dealers", href: "/dealers" },
  ],
  Solutions: [
    { label: "Toyota Dealers", href: "/solutions/toyota" },
    { label: "Ford Dealers", href: "/solutions/ford" },
    { label: "Service Departments", href: "/solutions/service" },
    { label: "BDC Teams", href: "/solutions/bdc" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Grievance", href: "/grievance" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black text-gray-500 mt-auto border-t border-gold/15">
      <div className="luxury-divider" />
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <FooterBrand height={34} />
            <p className="text-sm leading-relaxed mt-5 max-w-xs text-gray-500">
              The AI voice platform built for automotive retail. Turn every call into revenue.
            </p>
            <Link
              href="/demo"
              className="inline-flex mt-6 h-10 items-center px-6 rounded-full border border-gold/40 text-gold-400 text-xs font-semibold uppercase tracking-luxury hover:bg-gold-500/10 transition-colors"
            >
              Request access
            </Link>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-gold-500/90 font-semibold text-[10px] uppercase tracking-luxury mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-gold-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="luxury-divider mb-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs tracking-wide">
          <p>© {new Date().getFullYear()} DealerVoice. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <ManageCookiesLink />
            <span className="text-gray-600">Automotive AI · Global</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
