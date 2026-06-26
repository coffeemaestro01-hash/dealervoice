import { backfillStripeSubscriptionIncome } from "../lib/income/backfill-stripe";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();

backfillStripeSubscriptionIncome()
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
