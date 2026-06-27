import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import Link from "next/link";
import { getSalesAssistantFeatures, SALES_ASSISTANT_PLAN_COPY } from "@/lib/sales-assistant/features";
import { Bot, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

async function getContext(userId: string) {
  const staff = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    include: {
      dealership: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscription: { select: { plan: true, status: true } },
        },
      },
    },
  });
  if (!staff) return null;

  const plan = staff.dealership.subscription?.plan ?? "FREE";
  const features = getSalesAssistantFeatures(plan, staff.dealership.subscription?.status);

  const [assistantLeads, totalLeads] = await Promise.all([
    prisma.lead.count({
      where: { dealershipId: staff.dealership.id, source: { startsWith: "ai_assistant:" } },
    }),
    prisma.lead.count({ where: { dealershipId: staff.dealership.id } }),
  ]);

  return { dealer: staff.dealership, plan, features, assistantLeads, totalLeads };
}

export default async function DealerAssistantPage() {
  const user = await requireAuth();
  const ctx = await getContext(user.id);

  if (!ctx) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No dealership linked to your account.</p>
      </div>
    );
  }

  const { dealer, plan, features, assistantLeads, totalLeads } = ctx;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="text-primary" size={24} />
          AI Sales Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          24/7 lead capture and buyer conversations on your DealerVoice profile
          {features.websiteEmbed ? " and website embed." : "."}
        </p>
      </div>

      {!features.enabled ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div className="flex gap-3">
            <Lock className="text-amber-600 shrink-0" size={20} />
            <div>
              <h2 className="font-semibold text-foreground">Upgrade to unlock</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI Sales Assistant starts on <strong>Pro ($199/mo)</strong>. Appointment booking and automated follow-ups
                are on <strong>Pro+ ($349/mo)</strong>.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/dealer/billing">View plans</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex gap-3">
            <CheckCircle2 className="text-primary shrink-0" size={20} />
            <div>
              <p className="font-semibold text-foreground">Live on your profile</p>
              <p className="text-sm text-muted-foreground mt-1">
                Buyers see a &quot;Chat with us 24/7&quot; button on{" "}
                <Link href={`/dealership/${dealer.slug}`} className="text-primary hover:underline">
                  your public page
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Stat label="Assistant leads" value={assistantLeads} />
            <Stat label="All inbound leads" value={totalLeads} />
          </div>

          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Your plan: {plan.replace("_", "+")}</h2>
            <ul className="text-sm space-y-2">
              {(SALES_ASSISTANT_PLAN_COPY[features.tier === "basic" ? "basic" : features.tier === "full" ? "full" : "enterprise"] ?? []).map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            {features.tier === "basic" ? (
              <p className="text-xs text-muted-foreground mt-4">
                Upgrade to Pro+ for appointment scheduling and automated follow-up emails.{" "}
                <Link href="/dashboard/dealer/billing" className="text-primary hover:underline">
                  Upgrade →
                </Link>
              </p>
            ) : null}
          </div>

          {features.websiteEmbed ? (
            <div className="bg-card border rounded-xl p-5 text-sm">
              <h2 className="font-semibold mb-2">Website embed</h2>
              <p className="text-muted-foreground mb-3">Add this snippet before {`</body>`} on your dealer site:</p>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">{`<script src="https://dealervoice.io/embed/assistant.js" data-dealer="${dealer.id}" async></script>`}</pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
