#!/usr/bin/env node
/** Fourth-pass: green/amber/red/blue/emerald/orange/yellow/pink/sky → semantic tokens */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP = new Set(["node_modules", ".next", ".git"]);

const COLORS = ["green", "amber", "red", "blue", "orange", "yellow", "lime", "emerald", "teal", "cyan", "sky", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];

const REPLACEMENTS = [
  ...COLORS.flatMap((c) => [
    [new RegExp(`border-${c}-\\d+`, "g"), "border-primary/20"],
    [new RegExp(`bg-${c}-\\d+`, "g"), "bg-primary/10"],
    [new RegExp(`text-${c}-\\d+`, "g"), "text-primary"],
    [new RegExp(`hover:text-${c}-\\d+`, "g"), "hover:text-primary"],
    [new RegExp(`fill-${c}-\\d+`, "g"), "fill-primary"],
    [new RegExp(`ring-${c}-\\d+`, "g"), "ring-primary"],
  ]),
  [/border-red-\d+/g, "border-destructive/30"],
  [/bg-red-\d+/g, "bg-destructive/10"],
  [/text-red-\d+/g, "text-destructive"],
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
  if (file.includes("reskin-colors-pass")) continue;
  let content = readFileSync(file, "utf8");
  const orig = content;
  for (const [re, rep] of REPLACEMENTS) content = content.replace(re, rep);
  if (content !== orig) {
    writeFileSync(file, content);
    changed++;
  }
}
console.log(`Pass 4: updated ${changed} files`);
