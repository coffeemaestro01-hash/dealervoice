#!/usr/bin/env node
/** Fifth-pass: fix pearl opacity, night/gold gradients, invalid shadow-ember-* */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git", "scripts"]);

const REPLACEMENTS = [
  [/bg-pearl\/95/g, "bg-pearl"],
  [/shadow-ember-\d+\/\d+/g, "shadow-ember"],
  [/shadow-ember-\d+/g, "shadow-ember"],
  [/from-night-900(?:\/\d+)?/g, "from-background"],
  [/via-night-900(?:\/\d+)?/g, "via-background"],
  [/to-night-900(?:\/\d+)?/g, "to-background"],
  [/from-night-800/g, "from-muted"],
  [/via-night-800/g, "via-muted"],
  [/to-night-800/g, "to-muted"],
  [/from-night\b/g, "from-background"],
  [/to-night\b/g, "to-muted"],
  [/from-gold-900(?:\/\d+)?/g, "from-primary/20"],
  [/to-gold-800/g, "to-primary/10"],
  [/to-gold-900(?:\/\d+)?/g, "to-primary/10"],
  [/via-gold-500\/\d+/g, "via-primary/60"],
  [/from-gold-600 to-amber-500/g, "bg-ember"],
  [/bg-gradient-to-br from-gold-900 to-gold-800/g, "bg-gradient-to-br from-primary/20 to-primary/10"],
  [/bg-gradient-to-r from-night to-night-800/g, "bg-pearl"],
  [/bg-gradient-to-b from-night-800 to-night-900/g, "bg-pearl"],
  [/bg-gradient-to-b from-night-900 via-night-800 to-night-900/g, "bg-pearl"],
  [/bg-gradient-to-br from-night-900 via-night-800 to-night-900/g, "bg-pearl"],
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
console.log(`Pass 5: updated ${changed} files`);
