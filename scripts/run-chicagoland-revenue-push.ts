/**
 * Chicagoland revenue push — drip follow-ups, new IL drips, upgrade nudges for claimed FREE dealers.
 * Usage: npm run outreach:chicagoland-push
 */
import { loadProjectEnv } from "./load-env";
import { runChicagolandRevenuePush } from "@/lib/outreach/chicagoland-push";

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
  const result = await runChicagolandRevenuePush();

  console.log("Snapshot before send:");
  console.log(JSON.stringify(result.snapshot, null, 2));
  console.log("\nDrip follow-ups (steps 2–3):");
  console.log(JSON.stringify(result.followUps, null, 2));
  console.log("\nNew Illinois drip starts (step 1):");
  console.log(JSON.stringify(result.autoStartIl, null, 2));
  console.log("\nUpgrade nudges (claimed FREE):");
  console.log(JSON.stringify(result.upgradeNudges, null, 2));
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
