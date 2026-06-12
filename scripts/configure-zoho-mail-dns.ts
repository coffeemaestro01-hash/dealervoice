/**
 * Point dealervoice.io MX to Zoho Mail (info@ inbox) and merge SPF for Zoho + Resend.
 * Preserves all existing DNS records (Resend DKIM, send subdomain, etc.).
 *
 * Requires Namecheap API env vars (whitelist your IP at namecheap.com → Profile → Tools → API):
 *   NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME, NAMECHEAP_CLIENT_IP
 *
 * Usage: npm run mail:configure-zoho
 */

import { loadProjectEnv } from "./load-env";

loadProjectEnv();

const SLD = "dealervoice";
const TLD = "io";
const DOMAIN = `${SLD}.${TLD}`;

const ZOHO_MX = [
  { address: "mx.zoho.com.", priority: 10 },
  { address: "mx2.zoho.com.", priority: 20 },
  { address: "mx3.zoho.com.", priority: 50 },
];

const ROOT_SPF = "v=spf1 include:zohomail.com include:amazonses.com ~all";

type Host = { name: string; type: string; address: string; mxPref?: number; ttl?: number };

function apiParams(command: string, extra: Record<string, string> = {}) {
  const user = process.env.NAMECHEAP_API_USER!;
  const key = process.env.NAMECHEAP_API_KEY!;
  const username = process.env.NAMECHEAP_USERNAME!;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP!;
  return new URLSearchParams({
    ApiUser: user,
    ApiKey: key,
    UserName: username,
    ClientIp: clientIp,
    Command: command,
    ...extra,
  });
}

function parseHosts(xml: string): Host[] {
  const hosts: Host[] = [];
  const re = /<host\s+([^>]+)\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const get = (k: string) => attrs.match(new RegExp(`${k}="([^"]*)"`))?.[1] ?? "";
    hosts.push({
      name: get("Name"),
      type: get("Type"),
      address: get("Address"),
      mxPref: get("MXPref") ? Number(get("MXPref")) : undefined,
      ttl: get("TTL") ? Number(get("TTL")) : 1800,
    });
  }
  return hosts;
}

async function namecheapGetHosts(): Promise<Host[] | null> {
  if (!process.env.NAMECHEAP_API_KEY) return null;
  const params = apiParams("namecheap.domains.dns.getHosts", { SLD, TLD });
  const res = await fetch(`https://api.namecheap.com/xml.response?${params}`);
  const text = await res.text();
  if (!text.includes('Status="OK"')) {
    console.error("getHosts failed:", text.slice(0, 500));
    return null;
  }
  return parseHosts(text);
}

async function namecheapSetHosts(hosts: Host[]) {
  const params = apiParams("namecheap.domains.dns.setHosts", {
    SLD,
    TLD,
    EmailType: "MX",
  });
  hosts.forEach((h, i) => {
    const n = i + 1;
    params.set(`HostName${n}`, h.name);
    params.set(`RecordType${n}`, h.type);
    params.set(`Address${n}`, h.address);
    if (h.type === "MX" && h.mxPref != null) params.set(`MXPref${n}`, String(h.mxPref));
    params.set(`TTL${n}`, String(h.ttl ?? 1800));
  });
  const res = await fetch(`https://api.namecheap.com/xml.response?${params}`);
  const text = await res.text();
  if (!text.includes('Status="OK"')) {
    console.error("setHosts failed:", text.slice(0, 800));
    return false;
  }
  return true;
}

function mergeZohoDns(existing: Host[]): Host[] {
  // Drop ImprovMX apex MX; keep everything else
  let hosts = existing.filter(
    (h) => !(h.name === "@" && h.type === "MX" && h.address.includes("improvmx"))
  );

  // Replace apex SPF
  hosts = hosts.filter((h) => !(h.name === "@" && h.type === "TXT" && h.address.startsWith("v=spf1")));

  // Remove existing apex Zoho MX if re-running
  hosts = hosts.filter(
    (h) => !(h.name === "@" && h.type === "MX" && h.address.includes("zoho.com"))
  );

  const zohoMx: Host[] = ZOHO_MX.map((mx) => ({
    name: "@",
    type: "MX",
    address: mx.address,
    mxPref: mx.priority,
    ttl: 1800,
  }));

  const spf: Host = { name: "@", type: "TXT", address: ROOT_SPF, ttl: 1800 };

  // Ensure Resend send subdomain exists
  const hasSendMx = hosts.some(
    (h) => h.name === "send" && h.type === "MX" && h.address.includes("amazonses")
  );
  const hasSendSpf = hosts.some(
    (h) => h.name === "send" && h.type === "TXT" && h.address.startsWith("v=spf1")
  );
  if (!hasSendMx) {
    hosts.push({
      name: "send",
      type: "MX",
      address: "feedback-smtp.us-east-1.amazonses.com.",
      mxPref: 10,
      ttl: 1800,
    });
  }
  if (!hasSendSpf) {
    hosts.push({
      name: "send",
      type: "TXT",
      address: "v=spf1 include:amazonses.com ~all",
      ttl: 1800,
    });
  }

  return [...zohoMx, spf, ...hosts];
}

async function main() {
  console.log(`Configuring ${DOMAIN} for Zoho Mail (info@${DOMAIN} primary inbox)…\n`);

  const aliases = [
    "support", "dealers", "press", "hello", "billing", "privacy", "legal",
    "grievance", "advertise", "careers", "api", "admin", "noreply",
  ];

  console.log("Zoho aliases to add in Zoho Mail Admin → Users → info@ → Aliases:");
  console.log(`  ${aliases.map((a) => `${a}@${DOMAIN}`).join(", ")}\n`);

  const existing = await namecheapGetHosts();

  if (!existing) {
    console.log("Namecheap API not configured — add these records manually:\n");
    for (const mx of ZOHO_MX) console.log(`  MX  @  ${mx.address}  priority ${mx.priority}`);
    console.log(`  TXT @  ${ROOT_SPF}\n`);
    console.log("Remove ImprovMX MX records at @ if present.");
    process.exit(0);
  }

  console.log(`Fetched ${existing.length} existing DNS records from Namecheap.`);
  const merged = mergeZohoDns(existing);
  console.log(`Applying ${merged.length} records (Zoho MX + merged SPF)…\n`);

  const ok = await namecheapSetHosts(merged);
  if (ok) {
    console.log("✓ DNS updated: apex MX → Zoho, SPF includes Zoho + Resend.");
    console.log("  Verify in Zoho Mail Admin that dealervoice.io shows as verified.");
    console.log("  Add aliases listed above so all role addresses deliver to info@.");
  } else {
    console.log("✗ DNS update failed. Check API credentials and IP whitelist.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
