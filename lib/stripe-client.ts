'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

/**
 * Browser-side Stripe.js singleton.
 *
 * `loadStripe()` returns a memoised Promise — calling it more than once
 * is cheap, but the explicit module-level cache keeps things obvious.
 */
let _stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  if (_stripePromise) return _stripePromise;

  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk) {
    // We deliberately don't throw — the UI can show a friendly fallback
    // if Stripe isn't configured. The console warning makes the misconfig
    // obvious in dev.
    if (typeof window !== 'undefined') {
      console.warn(
        '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — payments are disabled.',
      );
    }
    return Promise.resolve(null);
  }

  _stripePromise = loadStripe(pk);
  return _stripePromise;
}
