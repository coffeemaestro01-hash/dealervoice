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
  completed: "text-green-600",
  in_progress: "text-gold-600",
  pending: "text-gray-300",
} as const;

export default async function AdminLaunchPage() {
  await requireAdminPage("/dashboard/admin/launch", "SUPER_ADMIN", "REVENUE");

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Global launch tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Five-phase worldwide rollout — India proved the model; all markets share one product.
        </p>
        <Link href="/dashboard/admin/income" className="text-sm text-gold-700 hover:underline mt-2 inline-block">
          View platform income →
        </Link>
      </div>

      <div className="space-y-6">
        {GLOBAL_LAUNCH_PHASES.map((phase) => {
          const Icon = STATUS_ICON[phase.status];
          return (
            <div key={phase.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start gap-3">
                <Icon className={`shrink-0 mt-0.5 ${STATUS_COLOR[phase.status]}`} size={22} />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Phase {phase.number}</p>
                  <h2 className="text-lg font-bold text-gray-900">{phase.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{phase.summary}</p>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gold-800">Revenue streams</p>
                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                      {phase.revenueStreams.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700">Deliverables</p>
                    <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {phase.deliverables.map((d) => (
                        <li key={d}>✓ {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    phase.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : phase.status === "in_progress"
                        ? "bg-gold-50 text-gold-800"
                        : "bg-gray-100 text-gray-500"
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
