import type { Metadata } from "next";
import { DealerInboxMarketing } from "@/components/marketing/DealerInboxMarketing";

export const metadata: Metadata = {
  title: "DealerVoice Inbox — Customer Support for Dealerships",
  description:
    "Professional customer support inbox for auto dealerships. AI email setup, team collaboration, smart templates, kanban, and automations — included with DealerVoice Pro and above.",
  openGraph: {
    title: "DealerVoice Inbox — Customer Support Built for the Lot",
    description:
      "Stop losing service and sales emails. One inbox, AI setup, your whole team — included with paid DealerVoice plans.",
  },
};

export default function DealerInboxPage() {
  return <DealerInboxMarketing />;
}
