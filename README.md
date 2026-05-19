# FITAURA

> Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort. Designed in Calgary, shipping worldwide.

A Next.js 15 e-commerce storefront with admin dashboard, Supabase backend, payments, SMS/email notifications, and PWA support.

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your environment variables in .env.local
npm run dev
```

The app runs on `http://localhost:3001` by default.

## Environment Variables

See `.env.example` for the complete list. Required:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project credentials
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only
- `NEXT_PUBLIC_APP_URL` — your production URL

Optional integrations: Resend (email), Moolre (payments & SMS), reCAPTCHA, Google Analytics.

## Database

Migrations live in `supabase/migrations`. After connecting your Supabase project:

```bash
export SUPABASE_PROJECT_REF=your-project-ref
npm run supabase:migrate
```

Or run each migration file manually via the Supabase SQL editor.

## Setup

For step-by-step provider setup (Supabase, Resend, Moolre, GA, reCAPTCHA, Cron, deployment), see [`SETUP.md`](./SETUP.md).

## Deployment

See `DEPLOY_VERCEL_NEW.md` for deploying to Vercel.

## Customisation

After setting up the project, see [`CUSTOMIZE.md`](./CUSTOMIZE.md) for the brand-customisation checklist (logo, photography, copy, currency, region).

## License

[Add your license here.]
