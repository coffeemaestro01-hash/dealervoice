/**
 * Chicagoland revenue push — drip follow-ups, new IL drips, upgrade nudges for claimed FREE dealers.
 * Usage: npm run outreach:chicagoland-push
 */
import { loadProjectEnv } from "./load-env";
import { runChicagolandRevenuePush } from "@/lib/outreach/chicagoland-push";
import { finishAdminJobRun, startAdminJobRun } from "@/lib/admin/business-tracking";

loadProjectEnv();

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is required.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  console.log("\n=== Chicagoland revenue push ===\n");

  const job = await startAdminJobRun("OUTREACH_CHICAGOLAND_PUSH", "CLI chicagoland revenue push");

  try {
    const result = await runChicagolandRevenuePush();
    const totalSent =
      result.followUps.sent + result.autoStartIl.started + result.upgradeNudges.sent;
    const totalFailed =
      result.followUps.failed + result.autoStartIl.errors + result.upgradeNudges.failed;
    const status =
      totalFailed > 0 && totalSent === 0 ? "FAILED" : totalFailed > 0 ? "PARTIAL" : "SUCCESS";

    await finishAdminJobRun(job.id, {
      status,
      summary: `CLI push — ${totalSent} sent (${result.followUps.sent} follow-ups, ${result.autoStartIl.started} new IL, ${result.upgradeNudges.sent} upgrades)`,
      payload: result as object,
    });

    console.log("Snapshot before send:");
    console.log(JSON.stringify(result.snapshot, null, 2));
    console.log("\nDrip follow-ups (steps 2–3):");
    console.log(JSON.stringify(result.followUps, null, 2));
    console.log("\nNew Illinois drip starts (step 1):");
    console.log(JSON.stringify(result.autoStartIl, null, 2));
    console.log("\nUpgrade nudges (claimed FREE):");
    console.log(JSON.stringify(result.upgradeNudges, null, 2));
    console.log("\nDone.\n");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    await finishAdminJobRun(job.id, {
      status: "FAILED",
      summary: "CLI chicagoland push failed",
      errorMessage: message,
    });
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
