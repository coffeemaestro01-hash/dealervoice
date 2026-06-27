import Link from "next/link";
import { MessageSquare, BarChart3, Award, PenLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: MessageSquare,
    title: "Respond publicly",
    body: "Address buyer feedback on your profile. Show prospects you stand behind the experience.",
  },
  {
    icon: BarChart3,
    title: "Track reputation",
    body: "Trust scores, review trends, and competitor context — one dashboard for your rooftop or group.",
  },
  {
    icon: PenLine,
    title: "Invite verified reviews",
    body: "QR codes and invite links help your happy customers leave reviews that count.",
  },
  {
    icon: Award,
    title: "Featured visibility",
    body: "Pro+ dealers earn featured badges, review backlinks, and priority placement in local browse.",
  },
];

export function DealerReputationSection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Reputation management</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Your reviews are your sales floor online
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            DealerVoice gives you a credible, verified profile — free to claim — with paid tools when you&apos;re ready to grow leads and visibility.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5">
              <p.icon className="text-primary mb-3" size={22} />
              <h3 className="font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/claim">
            <Button className="gap-2 font-semibold">Claim free profile</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="gap-2 border-primary/30">
              Compare plans <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
