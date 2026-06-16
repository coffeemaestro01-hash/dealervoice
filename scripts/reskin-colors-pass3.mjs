#!/usr/bin/env node
/** Third-pass: border-gray, ring-*, from-gray, divide-gray, etc. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git", "scripts/reskin-colors-pass3.mjs"]);

const REPLACEMENTS = [
  [/border-gray-\d+/g, "border-border"],
  [/divide-gray-\d+/g, "divide-border"],
  [/ring-gray-\d+/g, "ring-border"],
  [/ring-gold-\d+/g, "ring-primary"],
  [/ring-green-\d+/g, "ring-primary"],
  [/ring-yellow-\d+/g, "ring-primary"],
  [/ring-red-\d+/g, "ring-destructive"],
  [/bg-gold-\d+/g, "bg-primary"],
  [/bg-gray-\d+/g, "bg-muted"],
  [/text-red-\d+/g, "text-destructive"],
  [/from-gray-\d+/g, "from-muted"],
  [/to-gray-\d+/g, "to-muted"],
  [/via-gray-\d+/g, "via-muted"],
  [/from-gray-900\/\d+/g, "from-foreground/80"],
  [/to-gray-800/g, "to-foreground/70"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let content = readFileSync(file, "utf8");
  const orig = content;
  for (const [re, rep] of REPLACEMENTS) content = content.replace(re, rep);
  if (content !== orig) {
    writeFileSync(file, content);
    changed++;
  }
}
console.log(`Pass 3: updated ${changed} files`);
