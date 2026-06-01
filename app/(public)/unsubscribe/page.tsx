import type { Metadata } from "next";
import Link from "next/link";
import { MailX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Unsubscribe", description: "Manage your DealerVoice email preferences." };

export default function UnsubscribePage() {
  return (
    <div className="bg-white">
      <div className="container max-w-xl py-20 text-center">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gold-50 text-gold-600 mx-auto mb-5"><MailX size={26} /></span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Manage email preferences</h1>
        <p className="text-gray-600 mb-8">
          You can control which emails you receive from the <strong>Notifications</strong> tab in your account
          settings. Transactional emails (security, password resets, claim confirmations) are always sent so your
          account stays secure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login"><Button className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">Sign in to manage</Button></Link>
          <a href="mailto:support@dealervoice.io"><Button variant="outline" className="border-gold/50 text-gold-700 hover:bg-gold-50">Email support</Button></a>
        </div>
      </div>
    </div>
  );
}
