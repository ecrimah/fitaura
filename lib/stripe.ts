/**
 * Server-side Stripe singleton.
 *
 * Always import via `getStripe()` so the secret key is only resolved at
 * runtime — `import` time of API routes runs at build, when env vars
 * may not yet be available. Never import this module from a client
 * component; the `stripe` package is server-only.
 */
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Set it in .env.local (use sk_test_… for development).',
    );
  }

  _stripe = new Stripe(key, {
    // Pinning the API version locks behaviour against silent breaking
    // changes from Stripe. Bump after reviewing each release notes.
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    appInfo: {
      name: 'FITAURA Storefront',
      version: '1.0.0',
    },
  });

  return _stripe;
}

/**
 * Stripe Payment Intents expect integer amounts in the smallest currency unit
 * (cents for CAD, USD, GBP, EUR; bani for RON, etc.).
 *
 * Zero-decimal currencies (JPY, KRW, VND, …) take whole numbers directly.
 * FITAURA defaults to CAD which is two-decimal, but the helper supports both.
 *
 * Reference: https://stripe.com/docs/currencies#zero-decimal
 */
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga',
  'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

export function toStripeAmount(amount: number, currency: string): number {
  const code = currency.toLowerCase();
  if (ZERO_DECIMAL.has(code)) return Math.round(amount);
  return Math.round(amount * 100);
}

export function fromStripeAmount(amount: number, currency: string): number {
  const code = currency.toLowerCase();
  if (ZERO_DECIMAL.has(code)) return amount;
  return amount / 100;
}
