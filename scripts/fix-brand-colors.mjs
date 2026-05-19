#!/usr/bin/env node
/**
 * One-shot color sweep.
 *
 * Replaces Tailwind `blue-*` tokens with the FITAURA palette:
 *   blue → sienna (primary), cream (light backgrounds), ink (deepest dark)
 *
 * Also handles the legacy `font-['Pacifico']` literal — converted to
 * `font-display` (Anton) so headlines stop falling back to a cursive
 * face on pages that escaped the original refactor.
 *
 * Does NOT touch amber / green / red / yellow — those are semantic
 * (ratings / success / errors / warnings) and should stay where they are.
 *
 * Idempotent — safe to re-run.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const ROOT = resolve(process.cwd());

// blue shade → FITAURA token
const BLUE_MAP = {
  '50': 'cream-100',
  '100': 'sienna-50',
  '200': 'sienna-100',
  '300': 'sienna-300',
  '400': 'sienna-400',
  '500': 'sienna-500',
  '600': 'sienna-500',
  '700': 'sienna-500',
  '800': 'sienna-600',
  '900': 'ink-900',
  '950': 'ink-900',
};

function remapBlue(content) {
  // Match `blue-<shade>` anywhere a Tailwind token can sit (bg-, text-, border-,
  // ring-, from-, to-, via-, hover:, focus:, lg:, etc. — they all wrap around
  // this core pattern). Negative look-behind prevents `something_blue-500` from
  // matching inside an unrelated identifier.
  return content.replace(/\bblue-(\d{2,3})\b/g, (match, shade) => {
    return BLUE_MAP[shade] ?? match;
  });
}

function remapPacifico(content) {
  // font-['Pacifico'] → font-display
  return content.replace(/font-\['Pacifico'\]/g, 'font-display');
}

function pipe(...fns) {
  return (input) => fns.reduce((acc, fn) => fn(acc), input);
}

const transform = pipe(remapBlue, remapPacifico);

async function main() {
  const patterns = [
    'app/**/*.tsx',
    'components/**/*.tsx',
    'hooks/**/*.tsx',
    'lib/**/*.tsx',
  ];

  const files = new Set();
  for (const pattern of patterns) {
    for await (const file of glob(pattern, { cwd: ROOT })) {
      files.add(file);
    }
  }

  const sorted = [...files].sort();
  let changed = 0;
  const skipped = [];

  for (const rel of sorted) {
    const abs = resolve(ROOT, rel);
    const original = await readFile(abs, 'utf8');
    const updated = transform(original);
    if (updated !== original) {
      await writeFile(abs, updated, 'utf8');
      console.log(`✓ ${rel}`);
      changed++;
    } else {
      skipped.push(rel);
    }
  }

  console.log(`\nDone. ${changed} file(s) updated, ${skipped.length} unchanged.`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
