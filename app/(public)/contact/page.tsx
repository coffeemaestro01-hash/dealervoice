import type { Metadata } from "next";
import { Mail, MessageSquare, Building2, LifeBuoy, Share2, MessageCircle } from "lucide-react";
import { EMAILS } from "@/lib/constants/emails";
import { SOCIAL_HANDLES, WHATSAPP_BUSINESS } from "@/lib/constants/social";
import { SocialLinks } from "@/components/common/SocialLinks";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the DealerVoice team - support, partnerships, press, and dealer enquiries.",
};

const CHANNELS = [
  { icon: LifeBuoy, title: "Customer support", body: "Questions about your account or a review.", email: EMAILS.support },
  { icon: Building2, title: "Dealer enquiries", body: "Claim your profile or learn about Pro plans.", email: EMAILS.dealers },
  { icon: MessageSquare, title: "Press & media", body: "Interviews, data requests, and partnerships.", email: EMAILS.press },
];

export default function ContactPage() {
  return (
    <div className="bg-card">
      <section className="border-b border-border bg-muted">
        <div className="container py-14 text-center max-w-2xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Get in <span className="text-primary">touch</span></h1>
          <p className="text-lg text-muted-foreground">We usually respond within one business day. Choose the right channel below or send us a message.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            {CHANNELS.map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border p-6 shadow-sm">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0"><c.icon size={22} /></span>
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{c.body}</p>
                  <a href={`mailto:${c.email}`} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                    <Mail size={13} /> {c.email}
                  </a>
                </div>
              </div>
            ))}

            <div className="flex gap-4 rounded-2xl border border-primary/20 bg-muted/50 p-6 shadow-sm">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-muted text-primary shrink-0">
                <MessageCircle size={22} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">WhatsApp Business</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Fast replies for dealers and buyers — claim help, billing questions, or general support.
                </p>
                <a
                  href={WHATSAPP_BUSINESS.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <MessageCircle size={13} /> {WHATSAPP_BUSINESS.display}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Share2 size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">Follow DealerVoice</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Updates on Instagram {SOCIAL_HANDLES.instagram} and LinkedIn ({SOCIAL_HANDLES.linkedin}).
              </p>
              <SocialLinks variant="inline" />
            </div>
          </div>

          <form action={`mailto:${EMAILS.support}`} method="post" encType="text/plain" className="rounded-2xl border border-border p-7 shadow-sm bg-card">
            <h3 className="font-semibold text-foreground mb-4 text-lg">Send us a message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input name="name" required className="w-full h-11 rounded-lg border border-border px-3 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input name="email" type="email" required className="w-full h-11 rounded-lg border border-border px-3 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea name="message" rows={5} required className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <button type="submit" className="w-full h-11 rounded-lg bg-ember text-night-900 font-semibold hover:opacity-90 transition">Send message</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
