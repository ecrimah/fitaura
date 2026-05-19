# FITAURA — Customisation Checklist

This storefront ships as a **fully-branded FITAURA experience** built on a Next.js 15 + Supabase architecture. Everything functional is preserved; the steps below let you adapt it to your own assets, copy, and integrations.

---

## 1. Identity & Branding

The brand currently ships as **FITAURA — Confidence In Motion**, with a warm-neutral palette (burnt sienna, cream, charcoal). To rebrand, update:

| Where | What to change |
|------|----------------|
| `context/CMSContext.tsx` → `defaultSettings` | `site_name`, `site_tagline`, `currency`, `currency_symbol`, `primary_color`, social handles, contact info |
| `app/layout.tsx` | `SITE_NAME`, `SITE_TAGLINE`, all `metadata.*` fields (title, description, OG, keywords) |
| `public/manifest.json` | `name`, `short_name`, `description`, `theme_color`, `background_color` |
| `components/Header.tsx`, `components/Footer.tsx` | The hard-coded `FITAURA` wordmark in JSX (replace the `<span>F<span text-sienna>I</span>TAURA</span>` blocks with your logo / wordmark) |
| `public/logo.svg`, `public/logo-icon.svg` | Replace with your real logo files (keep filenames or update references) |
| `tailwind.config.js` | `sienna`, `cream`, `ink` palettes — change hex values if you want a different brand colour |

---

## 2. Hero & Homepage Copy

All on-brand copy lives in dedicated home components:

- `components/home/Hero.tsx` — three editorial slides (eyebrow, headline, copy, CTAs)
- `components/home/BrandStory.tsx` — "BUILT FOR EVERY AURA" story block + 3 value props
- `components/home/TestimonialStrip.tsx` — 3 customer testimonials (avatar gradient placeholder)
- `components/home/ValuePropsStrip.tsx` — 4 service guarantees (shipping / returns / secure / support)
- `components/home/CategoryGrid.tsx` — 5 category tiles (Activewear / Loungewear / Accessories / Outerwear / Essentials)
- `components/home/NewArrivalsSection.tsx` — pulls latest 4 products from Supabase; falls back to a stylised 4-product placeholder when DB is empty

---

## 3. Assets (see `public/ASSETS_GUIDE.md`)

The homepage currently uses AI-generated FITAURA photography under `/public/brand/*` (`/brand/hero-1.jpg` through `/brand/cart-hero.jpg`) and FITAURA logo PNGs. Replace these with your own activewear photography:

- [ ] `public/hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg` — homepage carousel (1920×1440 model photography recommended)
- [ ] `public/about-hero.jpg` — used in the "Built For Every Aura" story block
- [ ] `public/shop-hero.jpg`, `categories-hero.jpg`, `contact-hero.jpg`, `wishlist-hero.jpg`, `cart-hero.jpg` — page heroes
- [ ] `public/logo.svg`, `public/logo-icon.svg` — replace with real brand logo
- [ ] (Optional) `public/favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png` — see `public/ASSETS_GUIDE.md`

---

## 4. Configuration

- [ ] Update `package.json` — `name`, `description`, `author`, `license`, `homepage`, `repository`, `bugs`, `keywords`
- [ ] Replace `.env.local` placeholders with real values:
    - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`
    - Resend (email): `RESEND_API_KEY`, `ADMIN_EMAIL`, `EMAIL_FROM`
    - Moolre (payments + SMS): `MOOLRE_API_USER`, `MOOLRE_API_PUBKEY`, `MOOLRE_API_KEY`, `MOOLRE_ACCOUNT_NUMBER`, `MOOLRE_MERCHANT_EMAIL`, `MOOLRE_CALLBACK_SECRET`, `MOOLRE_SMS_API_KEY`
    - Analytics: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
    - reCAPTCHA: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
    - Cron: `CRON_SECRET`
    - App: `NEXT_PUBLIC_APP_URL`

---

## 5. Database

Four Supabase migrations live under `supabase/migrations/`:

- `20260209000000_complete_schema.sql` — full schema
- `20260218000000_allow_null_order_items_product_fks.sql`
- `20260219000000_contact_submissions.sql`
- `20260520000000_seed_fitaura_demo_products.sql` — **8 FITAURA-themed demo products** + 5 categories + variants. Delete this file before production-migrating if you don't want demo data.

After creating your Supabase project:

```bash
export SUPABASE_PROJECT_REF=your-project-ref
npm run supabase:migrate
```

Then run `scripts/enable-rls.sql` in the Supabase SQL editor. See `SECURITY_RLS_SETUP.md`.

For the full provider setup (Resend, Moolre, GA, reCAPTCHA, cron, deployment), see [`SETUP.md`](./SETUP.md).

- [ ] Create your Supabase project
- [ ] Run the migrations
- [ ] Apply the RLS policies
- [ ] Run `npm run create-admin` to seed your first admin user

---

## 6. Payments & SMS (Moolre)

- [ ] Sign up at moolre.com, get API credentials, fill `MOOLRE_*` env vars
- [ ] Configure callback URL: `https://shopfitaura.com/api/payment/moolre/webhook`
- [ ] Update the SMS sender ID — search for `'STORE'` in `components/admin/ProductForm.tsx`, `app/admin/test-sms/actions.ts`, and `lib/notifications.ts`
- [ ] See `SMS_INTEGRATION_STATUS.md` for the full SMS setup

---

## 7. Email (Resend)

- [ ] Sign up at resend.com, verify your sending domain
- [ ] Fill `RESEND_API_KEY`, `ADMIN_EMAIL`, `EMAIL_FROM` in `.env.local`
- [ ] Review the templates in `lib/notifications.ts` (orders, password resets, contact form)

---

## 8. Legal & SEO

- [ ] Replace `LICENSE` with your chosen license text
- [ ] Review and update `app/(store)/privacy/page.tsx` and `app/(store)/terms/page.tsx`
- [ ] Update `app/(store)/about/page.tsx`, `faqs/page.tsx`, `shipping/page.tsx` with your real copy
- [ ] `public/robots.txt` and `app/sitemap.ts` read from `NEXT_PUBLIC_APP_URL` — just set the env var

---

## 9. Market / Region

The shipped defaults are set to **USD / `$`** for the international activewear positioning. The underlying infrastructure still supports the original Ghana market configuration if you prefer:

- Currency: change `currency` and `currency_symbol` in `context/CMSContext.tsx` (and the symbol propagates to `ProductCard` via the `useCMS` hook)
- Phone validation: `lib/sanitize.ts → isValidGhanaPhone`
- Region dropdowns: `app/admin/pos/page.tsx`, `app/(store)/checkout/page.tsx` (Ghana 16 regions)
- Delivery zones: `app/(store)/shipping/page.tsx` and `app/(store)/checkout/page.tsx` (Accra / outside-Accra split)
- Payments: Moolre (West-African focused)

For non-Ghana launches, swap delivery zones, the region list, the phone validator, and (optionally) the payment processor.

---

## 10. Deployment

- [ ] Push to your own Git remote
- [ ] Connect repository to Vercel (or your preferred host)
- [ ] Mirror `.env.local` values onto the platform
- [ ] Configure custom domain
- [ ] Set up cron for payment reminders → `/api/cron/payment-reminders` with `CRON_SECRET`
- [ ] See `DEPLOY_VERCEL_NEW.md` for the Vercel walkthrough

---

## Architecture Notes

- **App Router**, Next.js 15, React 19, TypeScript strict, Tailwind CSS 4 (PostCSS plugin)
- **Server Components first** — the homepage (`app/(store)/page.tsx`) is fully server-rendered; only the carousel, product grid, and testimonial slider are client islands
- **Design tokens** in `tailwind.config.js`: `sienna`, `cream`, `ink` palettes with full 50→950 scales; `font-display` (Anton) for editorial headlines, `font-sans` (Inter) for body
- **Brand single-source-of-truth**: `CMSContext.defaultSettings`. Every consumer reads brand values via `useCMS().getSetting('...')`, falling back to the FITAURA defaults
- **Currency abstraction**: `ProductCard` reads `currency_symbol` from `useCMS()` — change once, propagates everywhere
