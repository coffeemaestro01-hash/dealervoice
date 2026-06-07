/**
 * Run prisma db push via Supabase direct/session connection (port 5432).
 * PgBouncer transaction pooler (6543) cannot apply DDL and will hang.
 */
import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  try {
    const raw = readFileSync(resolve(root, name), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional file */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.production");

const base = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!base) {
  console.error("DATABASE_URL or DIRECT_URL is required");
  process.exit(1);
}

const direct = base
  .replace(":6543/", ":5432/")
  .replace(/[?&]pgbouncer=true(&|$)/g, (_, tail) => (tail === "&" ? "&" : ""))
  .replace(/[?&]connection_limit=\d+(&|$)/g, (_, tail) => (tail === "&" ? "&" : ""))
  .replace(/\?&/, "?")
  .replace(/\?$/, "");

process.env.DATABASE_URL = direct;

console.log("Applying schema via direct connection (port 5432)…");

const result = spawnSync("npx", ["prisma", "db", "push", "--accept-data-loss"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  timeout: 90_000,
});

process.exit(result.status ?? 1);
