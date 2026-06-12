#!/usr/bin/env node
/**
 * Production smoke test — public routes and health checks.
 * Usage: node scripts/smoke-test.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "https://dealervoice.io";

const checks = [
  { name: "Homepage", path: "/", expect: 200, contains: "DealerVoice" },
  { name: "Chicago landing", path: "/chicago", expect: 200 },
  { name: "Dealers index", path: "/dealers", expect: 200 },
  { name: "US dealers", path: "/dealers/us", expect: 200 },
  { name: "Legacy IN redirect", path: "/dealers/in", expect: 308 },
  { name: "US inventory", path: "/dealers/us/inventory", expect: 200 },
  { name: "Blog", path: "/blog", expect: 200 },
  { name: "Research", path: "/research", expect: 200 },
  { name: "Trust hub", path: "/trust", expect: 200 },
  { name: "Vehicles browse", path: "/vehicles", expect: 200 },
  { name: "Pricing", path: "/pricing", expect: 200 },
  { name: "Advertise", path: "/advertise", expect: 200 },
  { name: "ads.txt", path: "/ads.txt", expect: 200, contains: "google.com" },
  { name: "robots.txt", path: "/robots.txt", expect: 200 },
  { name: "sitemap.xml", path: "/sitemap.xml", expect: 200 },
  { name: "llms.txt", path: "/llms.txt", expect: 200, contains: "Chicago", follow: true },
  { name: "Health API", path: "/api/health", expect: 200 },
  { name: "Search API", path: "/api/search/dealers?q=toyota&limit=3", expect: 200 },
  { name: "Login page", path: "/login", expect: 200 },
  { name: "Claim page", path: "/claim", expect: 200 },
  { name: "Privacy", path: "/privacy", expect: 200 },
  { name: "Methodology", path: "/methodology", expect: 200 },
];

let passed = 0;
let failed = 0;

console.log(`\nDealerVoice smoke test → ${BASE}\n`);

for (const c of checks) {
  const url = `${BASE}${c.path}`;
  try {
    const follow = c.follow !== false && c.expect !== 308;
    const res = await fetch(url, {
      redirect: follow ? "follow" : "manual",
      headers: { "User-Agent": "DealerVoice-SmokeTest/1.0" },
    });
    const text = res.status === 308 || res.status === 307 ? "" : await res.text();
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
