import type { Metadata } from "next";
import { ShieldAlert, Clock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Grievance Redressal",
  description: "Raise a grievance under India's IT Rules 2021 and DPDP Act 2023. Contact our Grievance Officer.",
};

const SLAS = [
  { label: "Acknowledgement of every grievance", time: "Within 24 hours" },
  { label: "Content under IT Rules 2021 Rule 3(2)(b) (impersonation, nudity, etc.)", time: "Within 72 hours" },
  { label: "Ordinary grievances", time: "Within 15 days" },
  { label: "Data-protection (DPDP Act) rights requests", time: "Within 30 days" },
];

export default function GrievancePage() {
  return (
    <div className="bg-white">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="container py-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-5">
            <ShieldAlert size={14} /> IT Rules 2021 · DPDP Act 2023
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Grievance <span className="text-gold">redressal</span></h1>
          <p className="text-lg text-gray-600">
            We take complaints about content, privacy, payments, and review integrity seriously. Here&apos;s how to reach us and what to expect.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-3xl space-y-10">
          {/* Officer block */}
          <div className="rounded-2xl border border-gold/30 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Grievance Officer</h2>
            <p className="text-gray-700 leading-relaxed">
              In accordance with the Information Technology Rules, 2021, grievances may be addressed to our Grievance Officer:
            </p>
            <ul className="mt-4 space-y-1.5 text-gray-700">
              <li><strong>Email:</strong> <a href="mailto:grievance@dealervoice.io" className="text-gold-700 hover:underline">grievance@dealervoice.io</a></li>
              <li><strong>Data Protection Officer (DPDP Act):</strong> <a href="mailto:dpo@dealervoice.io" className="text-gold-700 hover:underline">dpo@dealervoice.io</a></li>
              <li><strong>Hours:</strong> Monday-Friday, 10:00-18:00 IST</li>
            </ul>
          </div>

          {/* SLAs */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-gold-600" /> Our response timelines</h2>
            <div className="space-y-3">
              {SLAS.map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="text-gold-700 font-semibold whitespace-nowrap">{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to raise */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How to raise a grievance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Email <a href="mailto:grievance@dealervoice.io" className="text-gold-700 hover:underline">grievance@dealervoice.io</a> with:
              your name, contact details, the URL or content in question, the nature of your complaint, and any supporting evidence.
              You&apos;ll receive an acknowledgement with a ticket reference within 24 hours.
            </p>
            <a href="mailto:grievance@dealervoice.io?subject=Grievance%20%E2%80%93%20DealerVoice" className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gold-gradient text-night-900 font-semibold hover:opacity-90">
              <Mail size={16} /> Email the Grievance Officer
            </a>
            <p className="text-xs text-gray-400 mt-4">A self-service grievance form with live ticket tracking is being rolled out.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
