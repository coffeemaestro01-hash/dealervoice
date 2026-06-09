#!/usr/bin/env node
/**
 * Production smoke test — public routes and health checks.
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "https://dealervoice.io";

const checks = [
  { name: "Homepage", path: "/", expect: 200, contains: "DealerVoice" },
  { name: "Dealers index", path: "/dealers", expect: 200 },
  { name: "US dealers", path: "/dealers/us", expect: 200 },
  { name: "IN dealers", path: "/dealers/in", expect: 200 },
  { name: "US inventory", path: "/dealers/us/inventory", expect: 200 },
  { name: "Blog", path: "/blog", expect: 200 },
  { name: "Research", path: "/research", expect: 200 },
  { name: "Trust hub", path: "/trust", expect: 200 },
  { name: "Vehicles browse", path: "/vehicles", expect: 200 },
  { name: "Pricing", path: "/pricing", expect: 200 },
  { name: "ads.txt", path: "/ads.txt", expect: 200, contains: "google.com" },
  { name: "robots.txt", path: "/robots.txt", expect: 200 },
  { name: "sitemap.xml", path: "/sitemap.xml", expect: 200 },
  { name: "llms.txt", path: "/llms.txt", expect: 200 },
  { name: "Health API", path: "/api/health", expect: 200 },
  { name: "Search API", path: "/api/search/dealers?q=hyundai&limit=3", expect: 200 },
  { name: "Login page", path: "/login", expect: 200 },
  { name: "Claim page", path: "/claim", expect: 200 },
  { name: "Privacy", path: "/privacy", expect: 200 },
  { name: "Methodology", path: "/methodology", expect: 200 },
  { name: "AdSense in head", path: "/", expect: 200, contains: "ca-pub-7018496304938556" },
  { name: "Admitad meta", path: "/", expect: 200, contains: "verify-admitad" },
];

let passed = 0;
let failed = 0;

console.log(`\nDealerVoice smoke test → ${BASE}\n`);

for (const c of checks) {
  const url = `${BASE}${c.path}`;
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "DealerVoice-SmokeTest/1.0" } });
    const text = await res.text();
    const statusOk = res.status === c.expect;
    const contentOk = !c.contains || text.includes(c.contains);
    if (statusOk && contentOk) {
      console.log(`  ✓ PASS  ${c.name} (${res.status})`);
      passed++;
    } else {
      console.log(`  ✗ FAIL  ${c.name} — status ${res.status}${!contentOk ? `, missing "${c.contains}"` : ""}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ✗ FAIL  ${c.name} — ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed}/${checks.length} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
