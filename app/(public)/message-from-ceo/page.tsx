import type { Metadata } from "next";
import { CeoMessagePage } from "@/components/marketing/CeoMessagePage";
import { CEO, COMPANY } from "@/lib/constants/company";

export const metadata: Metadata = {
  title: `Message from ${CEO.name} — ${COMPANY.name}`,
  description: `${CEO.name}, ${CEO.title} of ${COMPANY.name}, on building a trust-first platform for dealerships — reputation, AI tools, and DealerVoice Inbox.`,
  openGraph: {
    title: `A message from ${CEO.name}, ${CEO.title}`,
    description: CEO.tagline,
  },
};

export default function MessageFromCeoPage() {
  return <CeoMessagePage />;
}
