# Asset Replacement Guide — FITAURA

The site ships fully-branded as FITAURA, with:

- **Logos** — user-supplied FITAURA PNG wordmarks (`fitaura-logo.png` for the header, `fitaura-logo-sienna.png` for the footer) plus SVG fallbacks (`logo.svg`, `logo-icon.svg`).
- **Hero photography** — AI-generated editorial activewear images in the FITAURA warm-neutral palette (burnt sienna / cream / brown). These render correctly out of the box. Replace with real product photography before public launch.

## Branding / Logo

| File | Used For | Notes |
|------|----------|-------|
| `fitaura-logo.png` | Header wordmark (cream/ink) | User-supplied PNG — replace to rebrand |
| `fitaura-logo-sienna.png` | Footer wordmark (sienna on dark) | User-supplied PNG — replace to rebrand |
| `logo.svg` | OG image fallback / legacy references | SVG wordmark with sienna accent |
| `logo-icon.svg` | Favicon, PWA icon, splash screen | Square SVG icon (FIT-mark) |

The header (`components/Header.tsx`) and footer (`components/Footer.tsx`) reference the PNG files via `<img>` tags. To swap the logo, drop new PNGs of the same name into `/public`, or edit the JSX to point at new filenames.

These logo files are referenced by:

- `app/layout.tsx` — favicon, apple-touch-icon, OG image fallback
- `public/manifest.json` — PWA icons (all sizes)
- `components/PWASplash.tsx`, `components/PWAPrompt.tsx` — install/splash screens
- `components/Header.tsx`, `components/Footer.tsx` — visible site logo

## Page Hero Backgrounds (AI-Generated FITAURA Photography)

These slots are filled with cohesive on-brand editorial photography (warm sienna/cream activewear). The JPGs live in `/public/brand/` and serve as **fallbacks** — production serves them from Supabase Storage (`media/homepage/*`) after running `npm run upload-media`. See `SETUP.md §1.6`.

> The files moved from `/public/*.jpg` to `/public/brand/*.jpg` to bypass browser HTTP cache holding earlier project owners' photography at the root paths. The new URL ensures every browser fetches the FITAURA photography fresh.

**Storefront read path:**

| Component | Reads from |
|-----------|------------|
| `components/home/Hero` | `cms_content` rows where `section='homepage_hero'` |
| `components/home/BrandStory` | `cms_content` row where `section='homepage' AND block_key='brand_story'` |
| `components/home/CategoryGrid` | `categories` table (image_url column) |
| `components/home/NewArrivalsSection` | `products` + `product_images` |

Every component falls back to the `/public/*.jpg` files if Supabase is unreachable, so the site keeps rendering even in a fully offline / unconfigured environment.

**To replace any photograph:** drop a new JPG into `/public` with the same filename, then `npm run upload-media`. The script re-uploads and rewires every URL in the DB.

| File | Used On | Aspect | Subject |
|------|---------|--------|---------|
| `brand/hero-1.jpg` | Homepage carousel slide 1 / Activewear category card | Portrait 3:2 | Seated model, brown sports-bra + leggings |
| `brand/hero-2.jpg` | Homepage carousel slide 2 / Loungewear category card | Portrait 3:2 | Mid-stretch model, cream set |
| `brand/hero-3.jpg` | Homepage carousel slide 3 / Accessories category card | Portrait 3:2 | Standing model, cream half-zip + wide-leg |
| `brand/about-hero.jpg` | `/about` page hero + homepage Brand Story image | Portrait 3:2 | Two diverse models, brown + cream |
| `brand/shop-hero.jpg` | `/shop` page hero / Outerwear category card | Landscape 3:2 | Walking model, head-to-toe brown |
| `brand/categories-hero.jpg` | `/categories` page hero / Essentials category card | Landscape 3:2 | Editorial flat-lay of pieces |
| `brand/contact-hero.jpg` | `/contact` page hero | Landscape 3:2 | Lifestyle interior, model cross-legged |
| `brand/wishlist-hero.jpg` | `/wishlist` page hero | Landscape 3:2 | Golden-hour aspirational lifestyle |
| `brand/cart-hero.jpg` | `/cart` page hero | Landscape 3:2 | Folded product flat-lay |

> File sizes are ~1.6–2.9 MB each. Next.js `<Image>` optimizes them on-the-fly when served, but you can pre-compress to WebP for faster initial loads — see Optimization Tips below.

## Missing — Add Your Own

These are referenced in code but not currently present in `public/`:

| File | Used On | Recommended Size |
|------|---------|------------------|
| `og-image.png` | Dedicated social share preview (optional — falls back to `logo-icon.svg`) | 1200×630px |

## Optional — Add If Desired

| File | Used For | Recommended Size |
|------|----------|------------------|
| `favicon.ico` | Browser tab icon (currently uses `logo-icon.svg`) | 32×32px |
| `apple-touch-icon.png` | iOS home screen icon | 180×180px |
| `icon-192.png` | Android PWA icon | 192×192px |
| `icon-512.png` | PWA splash screen icon | 512×512px |

Adding any of these requires updating `app/layout.tsx` (the `icons` block) and `public/manifest.json` (the `icons` array).

## Tools

- Favicon generator: <https://realfavicongenerator.net>
- OG image creator: <https://og-playground.vercel.app>
- Image optimization: <https://squoosh.app>
- Free stock photography: <https://unsplash.com>, <https://pexels.com>

## Optimization Tips

- Compress hero images to under 200KB each
- Use WebP or AVIF format for hero backgrounds
- Keep SVG logos under 10KB
- Generate `icon-192.png` and `icon-512.png` from a single 512px source
