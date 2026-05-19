#!/usr/bin/env node
/**
 * scripts/build-combined-seed.mjs
 *
 * Concatenates every migration in supabase/migrations/ into a single SQL file
 * (supabase/seed-fitaura.sql) that the FITAURA owner can paste into the
 * Supabase Studio SQL editor in one go.
 *
 * Order matters — files are concatenated in filename ASCII order, which
 * matches the timestamp prefix convention.
 *
 * Run: node scripts/build-combined-seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const OUT_FILE = path.join(__dirname, '..', 'supabase', 'seed-fitaura.sql');

const files = fs
  .readdirSync(MIG_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.error('No migration files found in', MIG_DIR);
  process.exit(1);
}

const parts = [
  `-- ============================================================================`,
  `-- FITAURA · COMBINED SEED — GENERATED ${new Date().toISOString()}`,
  `-- `,
  `-- Paste this entire file into the Supabase Studio SQL editor and click Run.`,
  `-- It is safe to re-run: every migration uses IF NOT EXISTS / ON CONFLICT.`,
  `-- `,
  `-- Source migrations (run in this order):`,
  ...files.map((f, i) => `--   ${String(i + 1).padStart(2, '0')}. ${f}`),
  `-- ============================================================================`,
  ``,
];

for (const file of files) {
  const body = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
  parts.push(`-- ------------------------------------------------------------`);
  parts.push(`-- BEGIN: ${file}`);
  parts.push(`-- ------------------------------------------------------------`);
  parts.push(body.trim());
  parts.push('');
  parts.push(`-- END: ${file}`);
  parts.push('');
}

fs.writeFileSync(OUT_FILE, parts.join('\n'), 'utf8');
console.log(`\nWrote ${OUT_FILE}`);
console.log(`Combined ${files.length} migration(s):`);
files.forEach((f) => console.log('  -', f));
