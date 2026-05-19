#!/usr/bin/env node
/**
 * scripts/generate-seo-assets.mjs
 *
 * Renders the full FITAURA SEO/PWA/favicon asset bundle from the OFFICIAL
 * brand logo at /public/brand/fitaura-logo.png (and its derivatives,
 * fitaura-monogram.png + fitaura-wordmark.png).
 *
 * To re-skin the brand:
 *   1. Drop a new logo into public/brand/fitaura-logo.png
 *   2. Re-run scripts/split-logo.mjs to regenerate monogram/wordmark
 *   3. Re-run this script
 *
 * Generated outputs (all in /public/, plus /app/favicon.ico):
 *
 *   FAVICONS              16/32/48/96 (also bundled into app/favicon.ico)
 *   APPLE                 180/167/152
 *   PWA                   192/512 (any) + 192/512 (maskable)
 *   MS TILE               150
 *   SOCIAL                og-image 1200x630 + og-image-square 1200x1200
 *
 * Run: node scripts/generate-seo-assets.mjs
 */

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'app');
const BRAND = path.join(PUB, 'brand');

// === BRAND TOKENS ============================================================
const SIENNA = '#D14F2B';
const SIENNA_LIGHT = '#E5612D';
const SIENNA_DARK = '#B83F1E';
const INK = '#26261F';
const CREAM = '#FBF7F1';
const CREAM_WARM = '#F0E8DD';

// === SOURCES =================================================================
const LOGO_FULL = path.join(BRAND, 'fitaura-logo.png');      // monogram + wordmark
const MONOGRAM = path.join(BRAND, 'fitaura-monogram.png');   // just the swirl mark
const WORDMARK = path.join(BRAND, 'fitaura-wordmark.png');   // just "FITAURA"

// === HELPERS =================================================================
async function ensureExists(p) {
  try { await fs.access(p); } catch { throw new Error(`Missing source: ${p}`); }
}

/**
 * Render the monogram centered on a square brand-colored tile.
 * @param {object} opts
 * @param {number} opts.size           output size in px (square)
 * @param {string} opts.bg             background color (hex)
 * @param {number} opts.safeZoneRatio  0..1 — fraction of the tile reserved for the mark
 * @param {string|null} opts.bgGradient null | 'sienna' | 'dark'
 * @param {string} opts.dest           output file path
 * @param {string} [opts.tint]         optional color to tint the (white) monogram to
 */
async function renderTile({ size, bg, safeZoneRatio, bgGradient, dest, tint }) {
  // Build background SVG (gradient or flat).
  let bgSvg;
  if (bgGradient === 'sienna') {
    bgSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${SIENNA_LIGHT}"/>
            <stop offset="100%" stop-color="${SIENNA_DARK}"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#g)"/>
      </svg>`;
  } else if (bgGradient === 'dark') {
    bgSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${INK}"/>
            <stop offset="100%" stop-color="#1A1A14"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#g)"/>
      </svg>`;
  } else {
    bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="${bg}"/></svg>`;
  }

  // Resize monogram into the safe zone.
  const monoMaxSize = Math.round(size * safeZoneRatio);
  let monoBuf = await sharp(MONOGRAM)
    .resize({ width: monoMaxSize, height: monoMaxSize, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Optionally tint the monogram. The source is sienna; to flip to cream we
  // recolor by replacing the non-transparent pixels with `tint` while
  // preserving alpha.
  if (tint) {
    const { data, info } = await sharp(monoBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height;
    const r = parseInt(tint.slice(1, 3), 16);
    const g = parseInt(tint.slice(3, 5), 16);
    const b = parseInt(tint.slice(5, 7), 16);
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = data[i + 3];
    }
    monoBuf = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  }

  const monoMeta = await sharp(monoBuf).metadata();
  const left = Math.round((size - monoMeta.width) / 2);
  const top = Math.round((size - monoMeta.height) / 2);

  await sharp(Buffer.from(bgSvg))
    .composite([{ input: monoBuf, left, top }])
    .png({ compressionLevel: 9, adaptiveFiltering: true, quality: 95 })
    .toFile(dest);

  const stat = await fs.stat(dest);
  return stat.size;
}

async function main() {
  console.log('FITAURA · SEO asset generator');
  console.log('============================\n');

  for (const f of [LOGO_FULL, MONOGRAM, WORDMARK]) {
    await ensureExists(f);
  }

  // ------------------------------------------------------------------ FAVICONS
  console.log('Favicons (cream monogram on sienna tile):');
  const fav16 = path.join(PUB, 'favicon-16x16.png');
  const fav32 = path.join(PUB, 'favicon-32x32.png');
  const fav48 = path.join(PUB, 'favicon-48x48.png');
  const fav96 = path.join(PUB, 'favicon-96x96.png');

  // At very small sizes the swirl detail is lost, but a sienna tile with the
  // monogram silhouette in cream stays recognizable. Safe zone shrinks at
  // tiny sizes to stop the mark touching the edges.
  for (const [size, dest, safe] of [
    [16, fav16, 0.78],
    [32, fav32, 0.74],
    [48, fav48, 0.72],
    [96, fav96, 0.7],
  ]) {
    const bytes = await renderTile({ size, bgGradient: 'sienna', safeZoneRatio: safe, dest, tint: CREAM });
    console.log(`  ${path.basename(dest).padEnd(28)} ${size}×${size}  (${(bytes / 1024).toFixed(1)} KB)`);
  }

  // favicon.ico → /app/favicon.ico (App Router convention)
  const icoBuf = await pngToIco([fav16, fav32, fav48]);
  const icoPath = path.join(APP, 'favicon.ico');
  await fs.writeFile(icoPath, icoBuf);
  console.log(`  app/favicon.ico${' '.repeat(16)} 16+32+48   (${(icoBuf.length / 1024).toFixed(1)} KB)`);

  // ------------------------------------------------------------------ APPLE
  console.log('\nApple touch icons (sienna monogram on cream tile):');
  for (const [size, name] of [
    [180, 'apple-touch-icon.png'],
    [152, 'apple-touch-icon-152.png'],
    [167, 'apple-touch-icon-167.png'],
  ]) {
    const dest = path.join(PUB, name);
    const bytes = await renderTile({ size, bg: CREAM, safeZoneRatio: 0.7, dest });
    console.log(`  ${name.padEnd(28)} ${size}×${size}  (${(bytes / 1024).toFixed(1)} KB)`);
  }

  // ------------------------------------------------------------------ PWA
  console.log('\nPWA / Android icons:');
  // Standard (any): sienna monogram on cream brand tile
  const pwa192 = path.join(PUB, 'icon-192.png');
  const pwa512 = path.join(PUB, 'icon-512.png');
  console.log(`  ${'icon-192.png'.padEnd(28)} 192×192  (${((await renderTile({ size: 192, bg: CREAM, safeZoneRatio: 0.7, dest: pwa192 })) / 1024).toFixed(1)} KB)`);
  console.log(`  ${'icon-512.png'.padEnd(28)} 512×512  (${((await renderTile({ size: 512, bg: CREAM, safeZoneRatio: 0.7, dest: pwa512 })) / 1024).toFixed(1)} KB)`);

  // Maskable: full-bleed sienna background, monogram in tighter safe zone
  const maskable192 = path.join(PUB, 'icon-maskable-192.png');
  const maskable512 = path.join(PUB, 'icon-maskable-512.png');
  console.log(`  ${'icon-maskable-192.png'.padEnd(28)} 192×192  (${((await renderTile({ size: 192, bgGradient: 'sienna', safeZoneRatio: 0.55, dest: maskable192, tint: CREAM })) / 1024).toFixed(1)} KB)`);
  console.log(`  ${'icon-maskable-512.png'.padEnd(28)} 512×512  (${((await renderTile({ size: 512, bgGradient: 'sienna', safeZoneRatio: 0.55, dest: maskable512, tint: CREAM })) / 1024).toFixed(1)} KB)`);

  // ------------------------------------------------------------------ MS TILE
  console.log('\nMicrosoft tile:');
  const mstile = path.join(PUB, 'mstile-150.png');
  const mstileBytes = await renderTile({ size: 150, bgGradient: 'sienna', safeZoneRatio: 0.65, dest: mstile, tint: CREAM });
  console.log(`  mstile-150.png${' '.repeat(15)} 150×150  (${(mstileBytes / 1024).toFixed(1)} KB)`);

  // ------------------------------------------------------------------ OG IMAGE
  console.log('\nSocial / OG images (real logo on brand canvas):');

  // 1200x630 landscape: cream canvas, full logo lockup left-anchored,
  //                     domain + tagline copy on the right.
  const ogW = 1200, ogH = 630;
  const ogBg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ogW} ${ogH}" width="${ogW}" height="${ogH}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${CREAM}"/>
          <stop offset="100%" stop-color="${CREAM_WARM}"/>
        </linearGradient>
      </defs>
      <rect width="${ogW}" height="${ogH}" fill="url(#g)"/>
      <rect x="${ogW - 8}" y="60" width="6" height="${ogH - 120}" rx="3" fill="${SIENNA}" opacity="0.6"/>
    </svg>`;

  const logoTargetW = 520;
  const logoBuf = await sharp(LOGO_FULL)
    .resize({ width: logoTargetW, fit: 'inside' })
    .toBuffer();
  const logoMeta = await sharp(logoBuf).metadata();

  const ogCopy = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ogW} ${ogH}" width="${ogW}" height="${ogH}">
      <text x="${ogW - 60}" y="240" font-family="'Inter','Helvetica',sans-serif" font-size="20" font-weight="600" fill="${INK}" letter-spacing="6" text-anchor="end" opacity="0.6">MODERN LIFESTYLE CLOTHING</text>
      <text x="${ogW - 60}" y="330" font-family="'Playfair Display','Georgia',serif" font-size="56" font-weight="500" font-style="italic" fill="${INK}" text-anchor="end">Confidence In Motion.</text>
      <rect x="${ogW - 240}" y="360" width="180" height="6" rx="3" fill="${SIENNA}"/>
      <text x="${ogW - 60}" y="420" font-family="'Inter','Helvetica',sans-serif" font-size="22" font-weight="400" fill="#6B6B66" text-anchor="end">Gymwear  ·  Athleisure  ·  Lifestyle</text>
      <text x="${ogW - 60}" y="555" font-family="'Inter','Helvetica',sans-serif" font-size="20" font-weight="700" fill="${INK}" letter-spacing="5" text-anchor="end">SHOPFITAURA.COM</text>
    </svg>`;

  const ogPath = path.join(PUB, 'og-image.png');
  await sharp(Buffer.from(ogBg))
    .composite([
      { input: logoBuf, left: 100, top: Math.round((ogH - logoMeta.height) / 2) },
      { input: Buffer.from(ogCopy), top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9, quality: 92 })
    .toFile(ogPath);
  const ogBytes = (await fs.stat(ogPath)).size;
  console.log(`  og-image.png${' '.repeat(19)} ${ogW}×${ogH} (${(ogBytes / 1024).toFixed(1)} KB)`);

  // Square 1200×1200 for Pinterest / WhatsApp / IG
  const sqSize = 1200;
  const sqBg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sqSize} ${sqSize}" width="${sqSize}" height="${sqSize}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${CREAM}"/>
          <stop offset="100%" stop-color="${CREAM_WARM}"/>
        </linearGradient>
      </defs>
      <rect width="${sqSize}" height="${sqSize}" fill="url(#g)"/>
      <rect x="0" y="${sqSize - 120}" width="${sqSize}" height="120" fill="${INK}"/>
      <text x="${sqSize / 2}" y="${sqSize - 48}" font-family="'Inter','Helvetica',sans-serif" font-size="24" font-weight="700" fill="${CREAM}" letter-spacing="8" text-anchor="middle">SHOPFITAURA.COM</text>
    </svg>`;

  const sqLogoTargetW = 680;
  const sqLogoBuf = await sharp(LOGO_FULL)
    .resize({ width: sqLogoTargetW, fit: 'inside' })
    .toBuffer();
  const sqLogoMeta = await sharp(sqLogoBuf).metadata();

  const sqCopy = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sqSize} ${sqSize}" width="${sqSize}" height="${sqSize}">
      <text x="${sqSize / 2}" y="820" font-family="'Playfair Display','Georgia',serif" font-size="64" font-weight="500" font-style="italic" fill="${INK}" text-anchor="middle">Confidence In Motion.</text>
      <rect x="${(sqSize - 200) / 2}" y="850" width="200" height="6" rx="3" fill="${SIENNA}"/>
      <text x="${sqSize / 2}" y="930" font-family="'Inter','Helvetica',sans-serif" font-size="26" font-weight="400" fill="#6B6B66" text-anchor="middle">Gymwear  ·  Athleisure  ·  Lifestyle</text>
    </svg>`;

  const ogSqPath = path.join(PUB, 'og-image-square.png');
  await sharp(Buffer.from(sqBg))
    .composite([
      { input: sqLogoBuf, left: Math.round((sqSize - sqLogoMeta.width) / 2), top: 180 },
      { input: Buffer.from(sqCopy), top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9, quality: 92 })
    .toFile(ogSqPath);
  const ogSqBytes = (await fs.stat(ogSqPath)).size;
  console.log(`  og-image-square.png${' '.repeat(12)} ${sqSize}×${sqSize} (${(ogSqBytes / 1024).toFixed(1)} KB)`);

  // browserconfig.xml — referenced by the MS tile meta
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150.png"/>
      <TileColor>${SIENNA}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`;
  await fs.writeFile(path.join(PUB, 'browserconfig.xml'), browserconfig);
  console.log(`\n  browserconfig.xml${' '.repeat(14)} (MS Tile config)`);

  console.log('\n✓ Done. All icons sourced from public/brand/fitaura-logo.png');
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
