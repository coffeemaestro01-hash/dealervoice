/**
 * Clear vendor/platform emails (Pixel Motion, dealer.com, etc.) and re-scrape dealer sites.
 * Usage: npm run outreach:remediate-vendor-emails
 */
import { loadProjectEnv } from "./load-env";
import { remediateVendorEmails } from "@/lib/outreach/discover-emails";

loadProjectEnv();

async function main() {
  console.log("\n=== Vendor email remediation ===\n");

  const result = await remediateVendorEmails({
    limit: 200,
    rediscover: true,
    autoStartDrip: false,
  });

  console.log(JSON.stringify(result, null, 2));
  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
