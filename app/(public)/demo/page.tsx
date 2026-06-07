import type { Metadata } from "next";
import { Calendar, Clock, Video } from "lucide-react";
import { DemoBookingForm } from "@/components/voice/DemoBookingForm";

export const metadata: Metadata = {
  title: "Book a Demo - DealerVoice AI Voice for Dealerships",
  description: "See DealerVoice answer calls, book appointments, and recover missed revenue — live in a 20-minute demo.",
};

const PERKS = [
  { icon: Video, title: "Live call demo", desc: "Hear AI handle a real service booking scenario" },
  { icon: Clock, title: "20 minutes", desc: "Focused on your store's ROI and integration path" },
  { icon: Calendar, title: "Same-week scheduling", desc: "Most demos booked within 48 hours" },
];

export default function DemoPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-night-gradient text-white border-b border-gold/20">
        <div className="container py-14 md:py-18 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Book your <span className="text-gold">live demo</span>
          </h1>
          <p className="text-gray-300 text-lg">
            See how DealerVoice turns missed calls into booked appointments — customized for your dealership.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container grid lg:grid-cols-2 gap-10 items-start max-w-5xl">
          <div className="space-y-4">
            {PERKS.map((p) => (
              <div key={p.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gold-50 text-gold-600 shrink-0">
                  <p.icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-500 pt-2">
              Prefer email? <a href="mailto:dealers@dealervoice.io" className="text-gold-700 hover:underline">dealers@dealervoice.io</a>
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-lg mb-5">Request a demo</h2>
            <DemoBookingForm source="demo-page" />
          </div>
        </div>
      </section>
    </div>
  );
}
