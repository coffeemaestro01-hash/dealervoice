import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { Search, PenLine, ShieldCheck, TrendingUp, Users, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/common/SocialLinks";
import { BrandAmbient } from "@/components/common/BrandAmbient";
import { COMPANY, companyHqLine } from "@/lib/constants/company";

export const metadata: Metadata = {
  title: "How It Works & About Us",
  description:
    "DealerVoice is a global automotive dealership review and trust platform, built in Chicago and available worldwide. Learn how we help car buyers and dealerships.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Search,
    title: "Find your dealer",
    body: "Search dealerships by name, brand, or location and compare ratings side by side.",
  },
  {
    icon: PenLine,
    title: "Share your experience",
    body: "Write a review backed by your purchase invoice or service receipt to earn a Verified badge.",
  },
  {
    icon: ShieldCheck,
    title: "We verify it",
    body: "Reviews are screened for authenticity using document checks and moderation.",
  },
  {
    icon: TrendingUp,
    title: "Everyone decides better",
    body: "Reputation scores and real experiences help buyers choose dealers they can trust.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verification first",
    body: "Reviews backed by proof of purchase carry more weight — so ratings reflect real customers.",
  },
  {
    icon: Globe,
    title: "Global coverage",
    body: "Dealership listings across Asia, Europe, North America, and beyond.",
  },
  {
    icon: Award,
    title: "Fair & transparent",
    body: "Our 0–100 reputation score is based on clear, published factors — no pay-to-win.",
  },
];

function compact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return n.toLocaleString();
}

async function getStats() {
  try {
    const [dealers, countries, reviews] = await Promise.all([
      prisma.dealership.count({ where: { deletedAt: null } }),
      prisma.country.count({ where: { dealerCount: { gt: 0 } } }),
      prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    ]);
    return { dealers, countries, reviews };
  } catch {
    return { dealers: 0, countries: 0, reviews: 0 };
  }
}

export default async function AboutPage() {
  const stats = await getStats();

  const statItems = [
    { value: compact(stats.dealers), label: "Dealerships listed" },
    { value: String(stats.countries), label: "Countries" },
    {
      value: stats.reviews > 0 ? compact(stats.reviews) : "Growing",
      label: stats.reviews > 0 ? "Published reviews" : "Review community",
    },
    { value: "Free", label: "To read & review" },
  ];

  return (
    <div className="bg-card">
      <section className="relative overflow-hidden border-b border-border">
        <BrandAmbient />
        <div className="container relative py-16 md:py-20 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <Globe size={14} /> {COMPANY.tagline}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5">
            Making car buying <span className="text-primary">trustworthy</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            DealerVoice is a global automotive dealership review and trust platform — like Trustpilot, built
            exclusively for car buyers and dealerships. Founded in {COMPANY.hqCity}, we connect shoppers with
            verified experiences across markets so no one has to gamble on where they buy or service their vehicle.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How DealerVoice works</h2>
            <p className="text-muted-foreground mt-2">Four simple steps to better dealership decisions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border p-6 bg-card shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                    <s.icon size={20} />
                  </span>
                  <span className="text-sm font-bold text-primary">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted border-y border-border">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Where we&apos;re from</h2>
          <p className="text-muted-foreground leading-relaxed">
            {COMPANY.name} is designed and operated from {companyHqLine()}. Our product, data infrastructure,
            and dealer subscriptions are US-based; our listings and reviews serve buyers and dealerships
            across the United States — starting with Chicago and expanding nationwide.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-card rounded-2xl border border-border p-7 shadow-sm">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-ember text-night-900 mb-4">
                  <v.icon size={22} />
                </span>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-14 text-center">
            {statItems.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Connect with us</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Questions? Visit our{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                contact page
              </Link>{" "}
              for the right department email.
            </p>
            <div className="flex justify-center">
              <SocialLinks variant="inline" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dealers">
                <Button size="lg" className="bg-ember text-night-900 font-semibold border-0 hover:opacity-90">
                  <Search size={16} className="mr-1" /> Search reviews
                </Button>
              </Link>
              <Link href="/claim">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  <Users size={16} className="mr-1" /> Claim your dealership
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
