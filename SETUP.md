# FITAURA — Provider Setup Guide

Step-by-step setup for the four integrations the storefront expects. Work through them top-to-bottom on first install.

## 0. Local Dev

```bash
npm install
cp .env.example .env.local      # then fill in values as you set up each provider below
npm run dev                     # http://localhost:3001
```

The site is fully functional with **placeholder** Supabase env vars — the homepage, navigation, cart and PWA all work; only live product data and authenticated areas need a real backend.

---

## 1. Supabase (required — products, auth, orders, reviews, CMS)

### 1.1 Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a strong DB password (store it in a password manager)
3. Choose a region close to your customers
4. Wait ~2 minutes for the project to provision

### 1.2 Grab credentials → `.env.local`

From **Project Settings → API**:

| Env var | Source |
|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key (server-only — never expose) |
| `SUPABASE_PROJECT_REF` | The slug in the URL: `https://<project-ref>.supabase.co` |

### 1.3 Run migrations

```bash
npm install -g supabase                     # install Supabase CLI
supabase login                              # one-time browser auth
export SUPABASE_PROJECT_REF=your-project-ref
npm run supabase:migrate                    # runs `supabase db push` against the linked project
```

This applies the five migrations under `supabase/migrations/`:

1. `20260209000000_complete_schema.sql` — full schema (categories, products, orders, reviews, blog, CMS content, etc.)
2. `20260218000000_allow_null_order_items_product_fks.sql` — allow product deletion without breaking historic orders
3. `20260219000000_contact_submissions.sql` — contact form table
4. `20260520000000_seed_fitaura_demo_products.sql` — 8 FITAURA-themed demo products + 5 categories + 99 variants. **Delete this file before production migrate** if you don't want demo data.
5. `20260521000000_seed_fitaura_homepage_cms.sql` — seeds `cms_content` with the 3 hero slides + brand-story block that the homepage Server Components read from.

### 1.4 Enable Row Level Security

Open the **Supabase SQL Editor** and paste the contents of `scripts/enable-rls.sql` (or follow `SECURITY_RLS_SETUP.md`). This locks down user-scoped tables so customers only see their own orders, addresses, reviews, etc.

### 1.5 Seed your admin user

```bash
npm run create-admin
```

You'll be prompted for an email + password. The script creates an `auth.users` record and promotes it to `role = 'admin'` in `public.profiles`. Sign in at `/admin/login` with those credentials.

### 1.6 Upload homepage photography to Supabase Storage

The complete-schema migration creates 5 public storage buckets automatically (`products`, `media`, `avatars`, `blog`, `reviews`). Now push the 9 AI-generated homepage photographs from `/public` into the `media` bucket and rewire every DB row (cms_content, categories, product_images) to point at the new Supabase Storage URLs:

```bash
npm run upload-media
```

The script:

- uploads `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`, `about-hero.jpg`, `shop-hero.jpg`, `categories-hero.jpg`, `contact-hero.jpg`, `wishlist-hero.jpg`, `cart-hero.jpg` into `media/homepage/*`
- rewrites `cms_content.image_url` (hero slides + brand story)
- rewrites `categories.image_url` (5 category cards)
- rewrites `product_images.url` (8 demo products)

It's idempotent — re-run safely if you swap photographs in `/public`. Need to replace photography later? Drop the new JPGs into `/public` with the same filenames and re-run `npm run upload-media`.

---

## 2. Resend (optional — transactional email)

Sends order confirmations, password resets, and contact-form auto-replies.

1. Sign up at [resend.com](https://resend.com)
2. **Add a sending domain** → follow the DNS instructions (SPF + DKIM + DMARC TXT records on your DNS provider). Verification takes a few minutes.
3. **Create an API key** under **API Keys** (full access)
4. Fill in:

   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   ADMIN_EMAIL=admin@shopfitaura.com        # receives order alerts, contact forms
   EMAIL_FROM=FITAURA <noreply@shopfitaura.com>
   ```

5. Test from `/admin/test-sms` (the same admin page also exposes test-email — or use `/admin → Settings`).

> If you skip Resend, the order flow still works — order emails are simply not sent (warnings appear in server logs).

---

## 3. Moolre (optional — payments + transactional SMS)

[Moolre](https://moolre.com) provides Mobile Money payment processing and an SMS API. Both are optional; if you skip Moolre, checkout falls back to "Pay Later / Manual" and SMS notifications are silently skipped.

### 3.1 Payments

1. Sign up + complete KYC at moolre.com
2. From **Settings → API Keys**, copy:

   | Env var | Source |
   |---------|--------|
   | `MOOLRE_API_USER` | API username |
   | `MOOLRE_API_PUBKEY` | Public API key |
   | `MOOLRE_API_KEY` | Private API key (server-only) |
   | `MOOLRE_ACCOUNT_NUMBER` | Your settlement account number |
   | `MOOLRE_MERCHANT_EMAIL` | Account email |
   | `MOOLRE_CALLBACK_SECRET` | Generate one yourself (any random 32+ char string) |

3. **Webhook URL** — point Moolre at:
   ```
   https://shopfitaura.com/api/payment/moolre/callback
   ```
   And set the shared secret to `MOOLRE_CALLBACK_SECRET`.

### 3.2 SMS

1. From Moolre's SMS dashboard, get your SMS API key → `MOOLRE_SMS_API_KEY`
2. Request a **sender ID** approval (alphanumeric, 6–11 chars — e.g. `FITAURA`). Once approved, update the sender ID in:
   - `components/admin/ProductForm.tsx` — currently `STORE`
   - `app/admin/test-sms/actions.ts`
   - `lib/notifications.ts`
3. Test from `/admin/test-sms`.

> See `SMS_INTEGRATION_STATUS.md` for the full SMS integration walkthrough.

---

## 4. Google Analytics (optional)

1. Create a **GA4 property** at [analytics.google.com](https://analytics.google.com)
2. Copy the Measurement ID (`G-XXXXXXXXXX`)
3. `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in `.env.local`

The GA snippet auto-mounts on every page when this var is set (see `app/layout.tsx`).

For Google Search Console verification, also set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the meta-tag content GSC gives you.

---

## 5. reCAPTCHA v3 (optional — bot protection for forms)

1. Sign up at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Register a v3 site, add `localhost` + your production domain
3. Fill:

   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
   RECAPTCHA_SECRET_KEY=6Lc...
   ```

The site key auto-mounts the reCAPTCHA script when present. Contact and signup forms verify the token server-side via `/api/recaptcha/verify`.

---

## 6. Cron (optional — payment-reminder sweeps)

The repo ships with `/api/cron/payment-reminders` which re-sends unpaid-order reminders.

Pick one:

- **Vercel Cron** — already wired in `vercel.json`; just set `CRON_SECRET` in Vercel env
- **External cron-as-a-service** (cron-job.org, EasyCron) — call:

   ```
   POST https://shopfitaura.com/api/cron/payment-reminders
   Authorization: Bearer ${CRON_SECRET}
   ```

   on whatever schedule you prefer (every 6 hours is a sensible default).

---

## 7. Deployment

The recommended host is Vercel:

1. Push to a Git remote (GitHub / GitLab / Bitbucket)
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. **Environment Variables** — copy every value from your `.env.local` into Vercel's env settings (for `production`, `preview`, `development` as appropriate)
4. Connect your custom domain → `shopfitaura.com`
5. Set `NEXT_PUBLIC_APP_URL=https://shopfitaura.com` in Vercel's production env
6. Re-deploy

See `DEPLOY_VERCEL_NEW.md` for the click-by-click walkthrough.

---

## 8. Verification checklist

Once you're set up, walk through these to confirm the install:

- [ ] `/` — homepage renders, hero carousel rotates, New Arrivals shows the 8 demo products (not the local placeholder grid)
- [ ] `/shop` — products list with filters
- [ ] `/categories` — 5 demo categories visible
- [ ] `/product/flow-sculpt-bra` — product detail page with variants
- [ ] `/cart` → `/checkout` → place a test order (Moolre sandbox if available)
- [ ] `/admin/login` — sign in with the admin user from §1.5
- [ ] `/admin/products` — admin sees demo products
- [ ] Order confirmation email arrives (Resend)
- [ ] Order SMS arrives (Moolre, if a phone was provided)

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Homepage shows placeholder products grid (not from DB) | Supabase env vars still on `YOUR_PROJECT_REF` placeholders, or migrations not yet run |
| `Error: Missing Supabase environment variables` | `.env.local` not loaded — restart `npm run dev` |
| `relation "public.products" does not exist` | Migrations haven't run — see §1.3 |
| Admin login fails | Admin user not seeded — see §1.5 |
| Order emails not arriving | `RESEND_API_KEY` empty or sender domain not verified; check server logs |
| Payment redirect fails | `MOOLRE_*` env vars missing or webhook URL not registered with Moolre |
| 401 from cron endpoint | `CRON_SECRET` env mismatch between Vercel and your cron caller |

For anything else, see `CUSTOMIZE.md` for the high-level checklist and `SECURITY_RLS_SETUP.md` for the security model.
