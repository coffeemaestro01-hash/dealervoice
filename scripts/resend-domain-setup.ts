/**
 * Print Resend domain DNS records for dealervoice.io
 * Usage: npm run resend:domain-setup
 * Add the printed DNS records at your domain registrar, then verify in Resend dashboard.
 */

import { Resend } from "resend";
import { loadProjectEnv } from "./load-env";

loadProjectEnv();

const DOMAIN = "dealervoice.io";

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set.");
    process.exit(1);
  }

  const resend = new Resend(key);

  const existing = await resend.domains.list().catch(() => null);
  let domainId: string | undefined;

  if (existing?.data?.data?.length) {
    const match = existing.data.data.find((d) => d.name === DOMAIN);
    domainId = match?.id;
  }

  if (!domainId) {
    const created = await resend.domains.create({ name: DOMAIN });
    domainId = created.data?.id;
    console.log(`Created domain ${DOMAIN} in Resend (id: ${domainId})`);
  } else {
    console.log(`Domain ${DOMAIN} already exists in Resend (id: ${domainId})`);
  }

  if (!domainId) {
    console.error("Could not create or find domain.");
    process.exit(1);
  }

  const detail = await resend.domains.get(domainId);
  const records = detail.data?.records ?? [];

  console.log("\nAdd these DNS records for", DOMAIN, ":\n");
  for (const r of records) {
    console.log(`  ${r.type}  ${r.name}  →  ${r.value}  (priority: ${r.priority ?? "—"})`);
  }

  console.log("\nAfter DNS propagates (up to 48h), verify:");
  console.log(`  await resend.domains.verify('${domainId}')`);
  console.log("\nSet EMAIL_FROM=DealerVoice <dealers@" + DOMAIN + "> in Vercel Production.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
