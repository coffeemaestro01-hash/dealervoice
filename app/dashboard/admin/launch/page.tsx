import { requireAdminPage } from "@/lib/admin/require-admin-page";
import { GLOBAL_LAUNCH_PHASES } from "@/lib/launch/phases";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_ICON = {
  completed: CheckCircle2,
  in_progress: Loader2,
  pending: Circle,
} as const;

const STATUS_COLOR = {
  completed: "text-primary",
  in_progress: "text-primary",
  pending: "text-muted-foreground",
} as const;

export default async function AdminLaunchPage() {
  await requireAdminPage("/dashboard/admin/launch", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Global launch tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Five-phase worldwide rollout — Chicago and Illinois first; U.S. expansion, then global markets.
        </p>
        <Link href="/dashboard/admin/income" className="text-sm text-primary hover:underline mt-2 inline-block">
          View platform income →
        </Link>
      </div>

      <div className="space-y-6">
        {GLOBAL_LAUNCH_PHASES.map((phase) => {
          const Icon = STATUS_ICON[phase.status];
          return (
            <div key={phase.id} className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-3">
                <Icon className={`shrink-0 mt-0.5 ${STATUS_COLOR[phase.status]}`} size={22} />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phase {phase.number}</p>
                  <h2 className="text-lg font-bold text-foreground">{phase.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{phase.summary}</p>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-primary">Revenue streams</p>
                    <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                      {phase.revenueStreams.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-foreground">Deliverables</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {phase.deliverables.map((d) => (
                        <li key={d}>✓ {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    phase.status === "completed"
                      ? "bg-muted text-primary"
                      : phase.status === "in_progress"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {phase.status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
