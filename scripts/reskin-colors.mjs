#!/usr/bin/env node
/**
 * Bulk color class replacements for pearl reskin.
 * Maps legacy dark/gold/gray utilities to semantic tokens.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git", "scripts/reskin-colors.mjs"]);

const REPLACEMENTS = [
  // Night/dark backgrounds → pearl
  [/bg-night-gradient/g, "bg-pearl"],
  [/bg-night-soft/g, "bg-pearl"],
  [/bg-night-900/g, "bg-pearl"],
  [/bg-night-800(?:\/\d+)?/g, "bg-pearl/95"],
  [/bg-night-700/g, "bg-muted"],
  [/bg-night-600/g, "bg-muted"],
  [/bg-night-500/g, "bg-muted"],
  [/bg-night\b/g, "bg-background"],
  [/card-dark/g, "bg-card border border-border shadow-soft"],

  // Gold → primary
  [/text-gold-300/g, "text-primary"],
  [/text-gold-400(?:\/\d+)?/g, "text-primary"],
  [/text-gold-500/g, "text-primary"],
  [/text-gold-600/g, "text-primary"],
  [/text-gold-700/g, "text-primary"],
  [/text-gold\b/g, "text-primary"],
  [/hover:text-gold-300/g, "hover:text-primary/80"],
  [/hover:text-gold-400/g, "hover:text-primary/80"],
  [/bg-gold-gradient/g, "bg-ember"],
  [/bg-gold-700/g, "bg-primary/90"],
  [/bg-gold-600/g, "bg-primary"],
  [/bg-gold-500(?:\/\d+)?/g, "bg-primary/10"],
  [/hover:bg-gold-700/g, "hover:bg-primary/90"],
  [/hover:bg-gold-600/g, "hover:bg-primary/90"],
  [/hover:bg-gold-500\/\d+/g, "hover:bg-primary/15"],
  [/border-gold-strong/g, "border-primary/60"],
  [/border-gold(?:\/\d+)?/g, "border-primary/30"],
  [/shadow-gold/g, "shadow-ember"],
  [/bg-gold\/\d+/g, "bg-primary/10"],

  // White text on light → foreground
  [/text-white(?:\/\d+)?/g, "text-foreground"],
  [/hover:text-white/g, "hover:text-foreground"],

  // Gray scale → muted/foreground
  [/text-gray-900/g, "text-foreground"],
  [/text-gray-800/g, "text-foreground"],
  [/text-gray-700/g, "text-foreground"],
  [/text-gray-600/g, "text-muted-foreground"],
  [/text-gray-500/g, "text-muted-foreground"],
  [/text-gray-400/g, "text-muted-foreground"],
  [/text-gray-300/g, "text-muted-foreground"],
  [/text-gray-200/g, "text-muted-foreground"],
  [/bg-gray-900/g, "bg-foreground"],
  [/bg-gray-800/g, "bg-foreground"],
  [/bg-gray-700/g, "bg-muted"],
  [/bg-gray-600/g, "bg-muted"],
  [/bg-gray-100/g, "bg-muted"],
  [/bg-gray-50/g, "bg-muted"],
  [/bg-gray-200/g, "bg-muted"],
  [/border-gray-200/g, "border-border"],
  [/border-gray-300/g, "border-border"],
  [/border-white\/\d+/g, "border-border"],

  // Brand blue → muted/primary
  [/text-brand-\d+/g, "text-primary"],
  [/bg-brand-\d+/g, "bg-muted"],
  [/text-blue-\d+/g, "text-primary"],
  [/bg-blue-\d+/g, "bg-muted"],
  [/text-purple-\d+/g, "text-muted-foreground"],
  [/bg-purple-\d+/g, "bg-muted"],
  [/text-green-\d+/g, "text-primary"],
  [/bg-green-\d+/g, "bg-muted"],
  [/text-red-400/g, "text-destructive"],
  [/text-red-600/g, "text-destructive"],
  [/text-red-500/g, "text-destructive"],
  [/bg-red-\d+/g, "bg-destructive/10"],
  [/text-lime-\d+/g, "text-primary"],
  [/bg-lime-\d+/g, "bg-muted"],
  [/text-yellow-\d+/g, "text-primary"],
  [/bg-yellow-\d+/g, "bg-muted"],
  [/text-orange-\d+/g, "text-primary"],
  [/bg-orange-\d+/g, "bg-muted"],

  // Slate/zinc/neutral
  [/text-slate-\d+/g, "text-muted-foreground"],
  [/bg-slate-\d+/g, "bg-muted"],
  [/text-zinc-\d+/g, "text-muted-foreground"],
  [/bg-zinc-\d+/g, "bg-muted"],
  [/text-neutral-\d+/g, "text-muted-foreground"],
  [/bg-neutral-\d+/g, "bg-muted"],
  [/text-stone-\d+/g, "text-muted-foreground"],
  [/bg-stone-\d+/g, "bg-muted"],

  // Misc
  [/bg-white(?:\/\d+)?/g, "bg-card"],
  [/hover:bg-white\/\d+/g, "hover:bg-muted"],
  [/shadow-black\/\d+/g, "shadow-soft"],
  [/bg-gold-100/g, "bg-primary/10"],
  [/text-gold-700/g, "text-primary"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === ".git") continue;
      walk(p, files);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(name) && !name.endsWith(".mjs")) {
      files.push(p);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let content = readFileSync(file, "utf8");
  const orig = content;
  for (const [re, rep] of REPLACEMENTS) {
    content = content.replace(re, rep);
  }
  if (content !== orig) {
    writeFileSync(file, content);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
