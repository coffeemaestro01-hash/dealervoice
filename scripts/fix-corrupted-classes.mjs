#!/usr/bin/env node
/** Fix corrupted border-primary/30-NNN patterns from bulk replace */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git"]);

const REPLACEMENTS = [
  [/border-primary\/30\/60/g, "border-primary/60"],
  [/border-primary\/30\/40/g, "border-primary/40"],
  [/border-primary\/30\/30/g, "border-primary/30"],
  [/border-primary\/30\/25/g, "border-primary/25"],
  [/border-primary\/30\/20/g, "border-primary/20"],
  [/border-primary\/20\/50/g, "border-primary/50"],
  [/border-primary\/30-\d+/g, "border-primary/30"],
  [/text-primary-200/g, "text-primary/80"],
  [/text-primary-800/g, "text-primary"],
  [/text-primary-900/g, "text-foreground"],
  [/hover:text-primary-200/g, "hover:text-primary/80"],
  [/focus:border-primary\/30\/60/g, "focus:border-primary/60"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) files.push(p);
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
console.log(`Fixed ${changed} files`);
