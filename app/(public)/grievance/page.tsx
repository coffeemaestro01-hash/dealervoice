import type { Metadata } from "next";
import { ShieldAlert, Clock, Mail } from "lucide-react";
import { COMPANY, companyHqLine } from "@/lib/constants/company";

export const metadata: Metadata = {
  title: "Support & Grievances",
  description: "Contact DealerVoice about content, privacy, billing, or review integrity. Global support with regional compliance where applicable.",
};

const SLAS = [
  { label: "Acknowledgement of every request", time: "Within 24 hours" },
  { label: "Urgent content or safety reports", time: "Within 72 hours" },
  { label: "General grievances", time: "Within 15 days" },
  { label: "Privacy / data rights requests (GDPR, CCPA, etc.)", time: "Within 30 days" },
];

export default function GrievancePage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-5">
            <ShieldAlert size={14} /> Global support · {COMPANY.hqCity}-based team
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Support &amp; <span className="text-gold">grievances</span></h1>
          <p className="text-lg text-gray-600">
            {COMPANY.name} is operated from {companyHqLine()} and serves users worldwide. We take complaints about
            content, privacy, payments, and review integrity seriously.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-3xl space-y-10">
          <div className="rounded-2xl border border-gold/30 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <ul className="space-y-1.5 text-gray-700">
              <li><strong>General grievances:</strong> <a href="mailto:grievance@dealervoice.io" className="text-gold-700 hover:underline">grievance@dealervoice.io</a></li>
              <li><strong>Privacy / data rights:</strong> <a href="mailto:dpo@dealervoice.io" className="text-gold-700 hover:underline">dpo@dealervoice.io</a></li>
              <li><strong>Billing:</strong> <a href="mailto:billing@dealervoice.io" className="text-gold-700 hover:underline">billing@dealervoice.io</a></li>
              <li><strong>Hours:</strong> Monday–Friday, 9:00–17:00 US Central (Chicago)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-gold-600" /> Response timelines</h2>
            <div className="space-y-3">
              {SLAS.map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="text-gold-700 font-semibold whitespace-nowrap">{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600">
            <h3 className="font-semibold text-gray-900 mb-2">Users in India</h3>
            <p>
              Where applicable under India&apos;s IT Rules 2021 and DPDP Act 2023, grievances may also be addressed to the
              contacts above. We comply with local consumer and data-protection requirements for users in jurisdictions
              where we operate.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How to raise a grievance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Email <a href="mailto:grievance@dealervoice.io" className="text-gold-700 hover:underline">grievance@dealervoice.io</a> with
              your name, contact details, the URL or content in question, and a description of the issue.
            </p>
            <a href="mailto:grievance@dealervoice.io?subject=Grievance%20%E2%80%93%20DealerVoice" className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gold-gradient text-night-900 font-semibold hover:opacity-90">
              <Mail size={16} /> Email support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
