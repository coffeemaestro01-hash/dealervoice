import type { Metadata } from "next";
import { Target, TrendingUp, Users } from "lucide-react";
import { SponsorshipCheckoutButtons, AdvertiseCta } from "@/components/advertise/SponsorshipCheckout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

export const metadata: Metadata = { title: "Advertise", description: "Reach in-market car buyers on DealerVoice." };

const REASONS = [
  { icon: Users, title: "High-intent audience", body: "Reach buyers actively researching where to purchase or service a vehicle." },
  { icon: Target, title: "Precise targeting", body: "Target by brand, location, and category to reach the right customers." },
  { icon: TrendingUp, title: "Measurable results", body: "Transparent reporting on impressions, clicks, and profile visits." },
];

export default async function AdvertisePage() {
  const session = await getServerSession(authOptions);
  let dealershipId: string | undefined;
  if (session?.user?.id) {
    const staff = await prisma.dealerStaff.findFirst({
      where: { userId: session.user.id, isActive: true },
      select: { dealershipId: true },
    });
    dealershipId = staff?.dealershipId;
  }

  return (
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">Advertise on <span className="text-primary">DealerVoice</span></h1>
          <p className="text-lg text-muted-foreground">Featured placement billed automatically via Stripe — no manual invoicing.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {REASONS.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border p-6 shadow-sm">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"><r.icon size={22} /></span>
                <h3 className="font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
          <SponsorshipCheckoutButtons dealershipId={dealershipId} />
          <div className="text-center">
            <AdvertiseCta />
          </div>
        </div>
      </section>
    </div>
  );
}
