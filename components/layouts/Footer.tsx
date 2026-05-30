import Link from "next/link";
import { Star } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Find Dealers", href: "/dealers" },
    { label: "Write a Review", href: "/write-review" },
    { label: "How It Works", href: "/about" },
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
    { label: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
              <Star className="fill-current text-blue-400" size={20} />
              DealerVoice
            </Link>
            <p className="text-sm leading-relaxed">
              The world&apos;s most trusted platform for car dealership reviews and reputation insights.
            </p>
            <div className="flex gap-3 mt-4">
              {["Twitter", "Facebook", "LinkedIn", "Instagram"].map((s) => (
                <a key={s} href="#" className="text-xs hover:text-white transition-colors" aria-label={s}>{s[0]}</a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} DealerVoice, Inc. All rights reserved.</p>
          <p>Available in 190+ countries · 8 languages</p>
        </div>
      </div>
    </footer>
  );
}
