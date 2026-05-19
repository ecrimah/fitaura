#!/usr/bin/env node
/**
 * scripts/replace-currency-symbol.mjs
 *
 * One-off sweep that replaces every hardcoded "GH₵" (Ghana Cedi) currency
 * symbol with "$" — FITAURA operates in CAD/USD. Stores using a different
 * currency can either re-run this script with a different replacement, or
 * (preferred) refactor the touched files to read currency_symbol from
 * site_settings via the admin Site Settings page.
 *
 * Usage:  node scripts/replace-currency-symbol.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const TARGET_DIRS = ['app', 'components', 'hooks', 'lib', 'context'];
const OLD = 'GH₵';
const NEW = '$';
const EXT = new Set(['.tsx', '.ts', '.jsx', '.js']);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (EXT.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

let touched = 0;
let occurrences = 0;
for (const dir of TARGET_DIRS) {
  const abs = path.join(ROOT, dir);
  try { await fs.access(abs); } catch { continue; }
  for await (const file of walk(abs)) {
    const original = await fs.readFile(file, 'utf8');
    if (!original.includes(OLD)) continue;
    const next = original.split(OLD).join(NEW);
    const count = original.split(OLD).length - 1;
    occurrences += count;
    touched += 1;
    await fs.writeFile(file, next, 'utf8');
    console.log(`✓ ${path.relative(ROOT, file)}  (${count})`);
  }
}

console.log(`\nDone — replaced ${occurrences} occurrence(s) across ${touched} file(s).`);
