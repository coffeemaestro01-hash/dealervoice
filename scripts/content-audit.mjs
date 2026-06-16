#!/usr/bin/env node
/**
 * Extract visible strings and href targets from TSX/JSX files for content audit.
 * Usage: node scripts/content-audit.mjs [output.json]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = join(import.meta.dirname, "..");
const OUT = process.argv[2] || join(ROOT, "CONTENT_BASELINE.json");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const EXT = /\.(tsx|jsx)$/;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXT.test(name)) files.push(p);
  }
  return files;
}

function extractStrings(content) {
  const strings = new Set();

  // JSX text nodes: >text<
  for (const m of content.matchAll(/>([^<{][^<]*?)</g)) {
    const t = m[1].trim();
    if (t && !/^\{/.test(t)) strings.add(t);
  }

  // String literal props: label, title, placeholder, aria-label, alt, description, etc.
  const propNames =
    /(?:label|title|placeholder|aria-label|alt|description|heading|subtitle|text|name|value|content|message|hint|tooltip|children)\s*=\s*["']([^"']+)["']/gi;
  for (const m of content.matchAll(propNames)) strings.add(m[1]);

  // Template literals in common props
  const templateProps =
    /(?:label|title|placeholder|aria-label|alt|description)\s*=\s*\{`([^`]+)`\}/gi;
  for (const m of content.matchAll(templateProps)) strings.add(m[1]);

  // Plain string literals assigned to common keys in objects/arrays
  for (const m of content.matchAll(/(?:label|title|text|name|heading|description|placeholder)\s*:\s*["']([^"']+)["']/g)) {
    strings.add(m[1]);
  }

  return [...strings].sort();
}

function extractHrefs(content) {
  const hrefs = new Set();

  for (const m of content.matchAll(/href\s*=\s*["'{]([^"'}]+)["'}]/g)) hrefs.add(m[1]);
  for (const m of content.matchAll(/href:\s*["']([^"']+)["']/g)) hrefs.add(m[1]);
  for (const m of content.matchAll(/to\s*=\s*["']([^"']+)["']/g)) hrefs.add(m[1]);

  return [...hrefs].sort();
}

const result = {};
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (rel.startsWith("scripts/") && !rel.includes("data/")) continue;
  const content = readFileSync(file, "utf8");
  const strings = extractStrings(content);
  const hrefs = extractHrefs(content);
  if (strings.length || hrefs.length) {
    result[rel] = { strings, hrefs };
  }
}

writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(`Wrote ${Object.keys(result).length} files to ${OUT}`);
