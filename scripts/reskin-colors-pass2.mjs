#!/usr/bin/env node
/** Second-pass cleanup for corrupted/remaining color classes */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git"]);

const REPLACEMENTS = [
  [/bg-gold-50(?:\/\d+)?/g, "bg-primary/10"],
  [/bg-gold-800/g, "bg-primary"],
  [/bg-gold-900/g, "bg-primary/90"],
  [/hover:bg-gold-900/g, "hover:bg-primary/90"],
  [/hover:bg-gold-800/g, "hover:bg-primary/90"],
  [/text-primary-800/g, "text-primary"],
  [/text-primary-900/g, "text-foreground"],
  [/text-primary-700/g, "text-primary"],
  [/border-primary\/30-\d+/g, "border-primary/30"],
  [/border-primary\/30-100/g, "border-primary/20"],
  [/bg-black\/80/g, "bg-foreground/60"],
  [/bg-black\/60/g, "bg-foreground/50"],
  [/bg-black\/50/g, "bg-foreground/40"],
  [/bg-black\/40/g, "bg-foreground/30"],
  [/text-gray-100/g, "text-foreground"],
  [/text-white/g, "text-primary-foreground"],
  [/bg-white\b/g, "bg-card"],
  [/text-black/g, "text-foreground"],
  [/bg-black\b/g, "bg-foreground"],
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
  if (file.includes("reskin-colors") || file.includes("reskin-colors-pass2")) continue;
  let content = readFileSync(file, "utf8");
  const orig = content;
  for (const [re, rep] of REPLACEMENTS) content = content.replace(re, rep);
  if (content !== orig) {
    writeFileSync(file, content);
    changed++;
  }
}
console.log(`Pass 2: updated ${changed} files`);
