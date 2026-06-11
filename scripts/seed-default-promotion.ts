/**
 * Ensure default launch promotion exists in Stripe + DB.
 * Usage: npm run seed:promotions
 */

import { loadProjectEnv } from "./load-env";
import { ensureDefaultProOneDollarPromo } from "@/lib/promotions";

loadProjectEnv();

async function main() {
  const promo = await ensureDefaultProOneDollarPromo();
  console.log(`Default promotion ready: ${promo.code} (${promo.discountType}, active=${promo.active})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
