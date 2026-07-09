/**
 * Illinois / Chicagoland dealer email discovery — direct scrape + Apify fallback.
 * Usage: npm run outreach:discover-il
 */
import { loadProjectEnv } from "./load-env";
import { runIllinoisEmailDiscoveryJob } from "@/lib/outreach/discover-emails";

loadProjectEnv();

async function main() {
  const limit = Number(process.env.DISCOVERY_LIMIT ?? 120);
  const apifyMax = Number(process.env.APIFY_MAX_URLS ?? 40);

  console.log("\n=== Illinois email discovery ===\n");
  console.log(`Limit: ${limit} dealers · Apify fallback max: ${apifyMax}\n`);

  const result = await runIllinoisEmailDiscoveryJob({ limit, apifyMaxUrls: apifyMax });

  console.log(JSON.stringify(result, null, 2));
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
