import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InboxUpgradePage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 space-y-6">
        <div className="flex gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Upgrade to unlock DealerVoice Inbox</h2>
            <p className="text-muted-foreground mt-2">
              Connect your dealership email, manage customer conversations in one place, and respond faster with AI-assisted drafts.
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground ml-1">
          <li className="flex items-center gap-2">
            <ArrowRight size={14} className="text-primary shrink-0" />
            Unified inbox for email and web inquiries
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight size={14} className="text-primary shrink-0" />
            Kanban workflow, templates, and automations
          </li>
          <li className="flex items-center gap-2">
            <ArrowRight size={14} className="text-primary shrink-0" />
            AI setup assistant and reply drafts
          </li>
        </ul>

        <Button asChild size="lg">
          <Link href="/pricing">View pricing plans</Link>
        </Button>
      </div>
    </div>
  );
}
