import type { Metadata } from "next";
import { ShieldAlert, Clock, Mail } from "lucide-react";
import { COMPANY, companyHqLine } from "@/lib/constants/company";
import { WHATSAPP_BUSINESS } from "@/lib/constants/social";

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
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <ShieldAlert size={14} /> Global support · {COMPANY.hqCity}-based team
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Support &amp; <span className="text-primary">grievances</span></h1>
          <p className="text-lg text-muted-foreground">
            {COMPANY.name} is operated from {companyHqLine()} and serves users worldwide. We take complaints about
            content, privacy, payments, and review integrity seriously.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-3xl space-y-10">
          <div className="rounded-2xl border border-primary/30 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-3">Contact</h2>
            <ul className="space-y-1.5 text-foreground">
              <li><strong>General grievances:</strong> <a href="mailto:grievance@dealervoice.io" className="text-primary hover:underline">grievance@dealervoice.io</a></li>
              <li><strong>Privacy / data rights:</strong> <a href="mailto:dpo@dealervoice.io" className="text-primary hover:underline">dpo@dealervoice.io</a></li>
              <li><strong>Billing:</strong> <a href="mailto:billing@dealervoice.io" className="text-primary hover:underline">billing@dealervoice.io</a></li>
              <li><strong>WhatsApp Business:</strong>{" "}
                <a href={WHATSAPP_BUSINESS.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{WHATSAPP_BUSINESS.display}</a>
              </li>
              <li><strong>Hours:</strong> Monday–Friday, 9:00–17:00 US Central (Chicago)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Clock size={18} className="text-primary" /> Response timelines</h2>
            <div className="space-y-3">
              {SLAS.map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                  <span className="text-foreground">{s.label}</span>
                  <span className="text-primary font-semibold whitespace-nowrap">{s.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted p-5 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground mb-2">Illinois &amp; U.S. users</h3>
            <p>
              {COMPANY.name} is operated from {companyHqLine()}. Disputes may be governed by the laws of the State of
              Illinois, United States, as described in our{" "}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>. We comply with applicable
              U.S. federal and state consumer-protection and privacy requirements.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-3">How to raise a grievance</h2>
            <p className="text-foreground leading-relaxed mb-4">
              Email <a href="mailto:grievance@dealervoice.io" className="text-primary hover:underline">grievance@dealervoice.io</a> with
              your name, contact details, the URL or content in question, and a description of the issue.
            </p>
            <a href="mailto:grievance@dealervoice.io?subject=Grievance%20%E2%80%93%20DealerVoice" className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-ember text-night-900 font-semibold hover:opacity-90">
              <Mail size={16} /> Email support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
