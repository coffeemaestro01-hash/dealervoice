import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Scale,
  CheckCircle2,
  ArrowRight,
  Eye,
  Lock,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How DealerVoice Earns Your Trust",
  description:
    "Every review is verified, every score is transparent, and AI assists — never replaces — real buyer experiences. Learn how DealerVoice protects car buyers.",
};

const HOW_REVIEWS_WORK = [
  {
    icon: Star,
    step: "01",
    title: "Buyer submits a review",
    body: "Any verified car buyer can write a review. We require an email and encourage submission of proof such as a purchase invoice, service receipt, or VIN.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "AI + human moderation",
    body: "Our AI scans for spam, duplicate content, and fake patterns. Flagged reviews go to a human moderator before publishing — we never silently delete.",
  },
  {
    icon: Eye,
    step: "03",
    title: "Dealer can respond, not edit",
    body: "Dealers may respond publicly to any review. They cannot edit, hide, or remove a review they dislike. Only DealerVoice moderators can remove content.",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Live on the profile",
    body: "Approved reviews appear on the dealer's profile and feed directly into their Trust Score, updated in near real time.",
  },
];

const AI_ROLE = [
  {
    icon: Zap,
    title: "Spam & fraud detection",
    body: "Our AI model flags statistically anomalous review bursts, copy-paste clusters, and suspicious language patterns for human review.",
  },
  {
    icon: Sparkles,
    title: "Review digest",
    body: "Gemini/GPT reads a dealer's most recent reviews and surfaces the key themes buyers care about — so you don't have to read 200 reviews.",
  },
  {
    icon: MessageSquare,
    title: "Dream Car Assistant",
    body: "Our AI chat helps you shortlist dealers by brand, city, and service type. It never steers you toward a paid placement.",
  },
  {
    icon: Lock,
    title: "What AI cannot do",
    body: "AI cannot publish, edit, or remove reviews. It cannot change a dealer's score. It cannot access your personal data beyond the current conversation.",
  },
];

const DISPUTE_STEPS = [
  { label: "Submit a dispute", detail: "Use the flag icon on any review or email trust@dealervoice.io." },
  { label: "We investigate", detail: "Our team reviews the evidence within 5 business days." },
  { label: "Decision is final", detail: "Both parties receive written notice. Decisions are final except in cases of new evidence." },
];

const SCORE_FACTORS = [
  { icon: Star, title: "Average Rating", weight: "35%", body: "The mean star rating of all published reviews." },
  { icon: ShieldCheck, title: "Verified Reviews", weight: "20%", body: "Proof-backed reviews carry additional weight." },
  { icon: MessageSquare, title: "Responsiveness", weight: "15%", body: "Dealers who respond show they care about buyers." },
  { icon: CheckCircle2, title: "Resolution Rate", weight: "10%", body: "Percentage of complaints that were resolved." },
  { icon: Scale, title: "Review Freshness", weight: "10%", body: "Recent experiences reflect current quality." },
  { icon: Zap, title: "Trend", weight: "10%", body: "Improving scores over the last 30 days." },
];

export default function TrustPage() {
  return (
    <div className="bg-card">
      {/* Hero */}
      <section className="border-b border-border bg-muted">
        <div className="container py-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1 mb-4">
            <ShieldCheck size={12} />
            Trust OS — Sprint 1
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">
            How DealerVoice earns{" "}
            <span className="text-primary">your trust</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Reviews are verified. Scores are transparent. AI assists buyers — it never replaces their
            voices. This page explains every layer of our trust system.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary underline underline-offset-2"
            >
              Read the full methodology <ArrowRight size={14} />
            </Link>
            <Link
              href="/dealers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Search verified dealers
            </Link>
          </div>
        </div>
      </section>

      {/* How Reviews Work */}
      <section className="py-14">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">How reviews work</h2>
          <p className="text-muted-foreground mb-8">
            Every review on DealerVoice goes through a four-step process before it reaches a dealer&apos;s
            profile.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {HOW_REVIEWS_WORK.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                      <item.icon size={18} />
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disputes */}
      <section className="py-14 bg-muted border-y border-border">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Dispute process</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            If a dealer believes a review violates our policies, or if a reviewer believes their
            review was incorrectly removed, either party may open a dispute.
          </p>
          <ol className="space-y-4">
            {DISPUTE_STEPS.map((s, i) => (
              <li key={s.label} className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm grid place-items-center">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-foreground">{s.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground mt-6">
            To open a dispute, email{" "}
            <a href="mailto:trust@dealervoice.io" className="text-primary hover:underline">
              trust@dealervoice.io
            </a>{" "}
            with the review URL and your evidence.
          </p>
        </div>
      </section>

      {/* Trust Score */}
      <section className="py-14">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">The Trust Score</h2>
          <p className="text-muted-foreground mb-8">
            Every dealership earns a 0-100 Trust Score. Here&apos;s exactly what feeds into it — no black
            boxes, no pay-to-win.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {SCORE_FACTORS.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                    <f.icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.title}</p>
                    <p className="text-xs font-bold text-primary">{f.weight}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-muted border border-border p-6">
            <p className="text-sm text-foreground">
              ✅ Claimed profiles can earn up to{" "}
              <strong>+10 bonus points</strong> for demonstrating ownership and accountability.
              <br />
              ✅ Scores update in <strong>near real time</strong> as new reviews arrive.
              <br />
              ✅ We publish our full methodology at{" "}
              <Link href="/methodology" className="text-primary hover:underline">
                /methodology
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* AI Role */}
      <section className="py-14 bg-muted border-y border-border">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">AI&apos;s role at DealerVoice</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            We use AI to protect buyers and save them time — never to manufacture trust or suppress
            genuine feedback.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {AI_ROLE.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                    <item.icon size={16} />
                  </span>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-12">
        <div className="container max-w-3xl text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Ready to find a dealer you can trust?
          </h2>
          <p className="text-muted-foreground mb-6">
            Search verified dealerships, read AI-digested buyer reviews, and get quotes — all in one
            place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dealers"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-foreground font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors"
            >
              Search Dealers <ArrowRight size={15} />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 border border-border hover:border-primary/30 text-foreground hover:text-primary font-medium rounded-xl px-6 py-2.5 text-sm transition-colors"
            >
              Read the Methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
