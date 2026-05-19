/**
 * FITAURA · upload-homepage-media
 *
 * One-time (or re-runnable) script that:
 *   1. Uploads the 9 hero photographs from /public to the Supabase `media`
 *      storage bucket under /homepage.
 *   2. Computes the resulting public Storage URLs.
 *   3. Rewrites every place in the DB that referenced the matching local path
 *      (/hero-1.jpg, /about-hero.jpg, …) so the storefront serves the images
 *      from Supabase rather than from the Next.js bundle.
 *
 *      - public.cms_content       (homepage_hero slides, brand_story block)
 *      - public.categories        (image_url)
 *      - public.product_images    (url)
 *
 * Idempotent: re-running uploads with `upsert: true`, then re-writes URLs.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY     (server-only — never expose)
 *
 * Run with:
 *   npm run upload-media
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BRAND_DIR = path.join(ROOT, 'public', 'brand');
const PUBLIC_URL_PREFIX = '/brand';

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------
function loadEnv() {
    const envPath = path.join(ROOT, '.env.local');
    if (!fs.existsSync(envPath)) return {};
    return Object.fromEntries(
        fs.readFileSync(envPath, 'utf-8')
            .split('\n')
            .filter((l) => /^[A-Z_]+=/.test(l.trim()))
            .map((l) => {
                const eq = l.indexOf('=');
                return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()];
            }),
    );
}

const env = { ...process.env, ...loadEnv() };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'media';
const PREFIX = 'homepage';

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('\nERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// The 9 files we manage. Each entry maps:
//   localPath  → the file in /public
//   storagePath → the destination inside the media bucket
//   purpose     → semantic role (for logging)
// ---------------------------------------------------------------------------
const FILES = [
    { local: 'hero-1.jpg', purpose: 'Homepage hero — slide 1 / Activewear card' },
    { local: 'hero-2.jpg', purpose: 'Homepage hero — slide 2 / Loungewear card' },
    { local: 'hero-3.jpg', purpose: 'Homepage hero — slide 3 / Accessories card' },
    { local: 'about-hero.jpg', purpose: 'Brand story / About hero' },
    { local: 'shop-hero.jpg', purpose: 'Shop hero / Outerwear card' },
    { local: 'categories-hero.jpg', purpose: 'Categories hero / Essentials card' },
    { local: 'contact-hero.jpg', purpose: 'Contact hero' },
    { local: 'wishlist-hero.jpg', purpose: 'Wishlist hero' },
    { local: 'cart-hero.jpg', purpose: 'Cart hero' },
];

function publicUrlFor(storagePath) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
}

// ---------------------------------------------------------------------------
// 1. Upload images
// ---------------------------------------------------------------------------
async function uploadAll() {
    console.log(`\n── Uploading to Supabase Storage (${BUCKET}/${PREFIX}) ──\n`);
    const mapping = new Map();
    for (const f of FILES) {
        const localPath = path.join(BRAND_DIR, f.local);
        if (!fs.existsSync(localPath)) {
            console.warn(`  SKIP   ${f.local.padEnd(22)} (file missing in /public/brand)`);
            continue;
        }
        const storagePath = `${PREFIX}/${f.local}`;
        const buf = fs.readFileSync(localPath);
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buf, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: true,
            });
        if (error) {
            console.error(`  FAIL   ${f.local.padEnd(22)} → ${error.message}`);
            continue;
        }
        const publicUrl = publicUrlFor(storagePath);
        mapping.set(`${PUBLIC_URL_PREFIX}/${f.local}`, publicUrl);
        const sizeKb = (buf.length / 1024).toFixed(1);
        console.log(`  OK     ${f.local.padEnd(22)} → ${storagePath}  (${sizeKb} KB)`);
    }
    return mapping;
}

// ---------------------------------------------------------------------------
// 2. Rewrite cms_content rows
// ---------------------------------------------------------------------------
async function rewriteCmsContent(mapping) {
    console.log(`\n── Rewriting cms_content image_url ──\n`);
    const { data: rows, error } = await supabase
        .from('cms_content')
        .select('id, section, block_key, image_url')
        .in('section', ['homepage_hero', 'homepage']);
    if (error) {
        console.error('  cms_content fetch failed:', error.message);
        return;
    }
    if (!rows?.length) {
        console.warn('  No cms_content rows yet — run the homepage CMS migration first.');
        return;
    }
    for (const row of rows) {
        const newUrl = mapping.get(row.image_url);
        if (!newUrl) {
            console.log(`  SKIP   ${row.section}/${row.block_key} (no mapping for ${row.image_url})`);
            continue;
        }
        const { error: upErr } = await supabase
            .from('cms_content')
            .update({ image_url: newUrl, updated_at: new Date().toISOString() })
            .eq('id', row.id);
        if (upErr) {
            console.error(`  FAIL   ${row.section}/${row.block_key} → ${upErr.message}`);
        } else {
            console.log(`  OK     ${row.section}/${row.block_key}`);
        }
    }
}

// ---------------------------------------------------------------------------
// 3. Rewrite categories.image_url
// ---------------------------------------------------------------------------
async function rewriteCategories(mapping) {
    console.log(`\n── Rewriting categories.image_url ──\n`);
    const { data: rows, error } = await supabase
        .from('categories')
        .select('id, slug, image_url');
    if (error) {
        console.error('  categories fetch failed:', error.message);
        return;
    }
    if (!rows?.length) {
        console.warn('  No categories yet — run the demo product seed migration to populate them.');
        return;
    }
    for (const row of rows) {
        const newUrl = mapping.get(row.image_url);
        if (!newUrl) continue;
        const { error: upErr } = await supabase
            .from('categories')
            .update({ image_url: newUrl, updated_at: new Date().toISOString() })
            .eq('id', row.id);
        if (upErr) {
            console.error(`  FAIL   ${row.slug} → ${upErr.message}`);
        } else {
            console.log(`  OK     ${row.slug}`);
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Rewrite product_images.url
// ---------------------------------------------------------------------------
async function rewriteProductImages(mapping) {
    console.log(`\n── Rewriting product_images.url ──\n`);
    const { data: rows, error } = await supabase
        .from('product_images')
        .select('id, product_id, url');
    if (error) {
        console.error('  product_images fetch failed:', error.message);
        return;
    }
    if (!rows?.length) {
        console.warn('  No product_images yet — run the demo product seed migration.');
        return;
    }
    let updated = 0;
    for (const row of rows) {
        const newUrl = mapping.get(row.url);
        if (!newUrl) continue;
        const { error: upErr } = await supabase
            .from('product_images')
            .update({ url: newUrl })
            .eq('id', row.id);
        if (upErr) {
            console.error(`  FAIL   product_image ${row.id} → ${upErr.message}`);
        } else {
            updated++;
        }
    }
    console.log(`  ${updated} product image rows rewritten.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    console.log('=== FITAURA · upload-homepage-media ===');
    console.log(`Supabase: ${SUPABASE_URL}`);
    console.log(`Bucket:   ${BUCKET}/${PREFIX}`);

    const mapping = await uploadAll();
    if (!mapping.size) {
        console.error('\nNothing uploaded. Aborting URL rewrites.');
        process.exit(1);
    }

    await rewriteCmsContent(mapping);
    await rewriteCategories(mapping);
    await rewriteProductImages(mapping);

    console.log('\n── Done ──');
    console.log(`Uploaded ${mapping.size} files. Reload the storefront to see Supabase-served images.\n`);
}

main().catch((err) => {
    console.error('\nFatal:', err.message);
    process.exit(1);
});
