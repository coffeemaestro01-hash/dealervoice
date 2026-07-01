import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  finishAdminJobRun,
  startAdminJobRun,
} from "@/lib/admin/business-tracking";
import { runChicagolandRevenuePush } from "@/lib/outreach/chicagoland-push";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = await startAdminJobRun(
    "OUTREACH_CHICAGOLAND_PUSH",
    "Chicagoland revenue push started",
    session.user.id
  );

  try {
    const result = await runChicagolandRevenuePush();
    const totalSent =
      result.followUps.sent +
      result.autoStartIl.started +
      result.upgradeNudges.sent;
    const totalFailed =
      result.followUps.failed +
      result.autoStartIl.errors +
      result.upgradeNudges.failed;

    const status =
      totalFailed > 0 && totalSent === 0
        ? "FAILED"
        : totalFailed > 0
          ? "PARTIAL"
          : "SUCCESS";

    const summary = `Chicagoland push — ${totalSent} sent (${result.followUps.sent} drip follow-ups, ${result.autoStartIl.started} new IL drips, ${result.upgradeNudges.sent} upgrade nudges)`;

    await finishAdminJobRun(job.id, {
      status,
      summary,
      payload: result as object,
    });

    return NextResponse.json({ ok: true, result, jobId: job.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    await finishAdminJobRun(job.id, {
      status: "FAILED",
      summary: "Chicagoland revenue push failed",
      errorMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
