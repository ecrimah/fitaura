'use client';

import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import { getStripeClient } from '@/lib/stripe-client';

interface StripePaymentFormProps {
  orderNumber: string;
  total: number;
  currency: string;
  /** Page to send the customer to after Stripe confirms. */
  returnUrl: string;
}

/**
 * FITAURA-themed Stripe Elements.
 *
 * Drops a PaymentIntent client_secret into Elements + PaymentElement so
 * customers can pay with cards, Apple Pay, Google Pay, Link, etc. — all
 * via the Stripe SDK with no card data ever hitting our servers.
 */
const appearance: Appearance = {
  theme: 'flat',
  variables: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontWeightNormal: '500',
    borderRadius: '6px',
    colorPrimary: '#D14F2B',
    colorBackground: '#FFFFFF',
    colorText: '#26261F',
    colorDanger: '#B91C1C',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '2px solid #E5D2B8',
      boxShadow: 'none',
      padding: '12px 14px',
      fontSize: '15px',
    },
    '.Input:focus': {
      border: '2px solid #D14F2B',
      boxShadow: '0 0 0 3px rgba(209, 79, 43, 0.15)',
    },
    '.Label': {
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#26261F',
      marginBottom: '6px',
    },
    '.Tab': {
      border: '2px solid #E5D2B8',
      padding: '12px 14px',
    },
    '.Tab--selected': {
      border: '2px solid #D14F2B',
    },
  },
};

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the client_secret as soon as the component mounts.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch('/api/payment/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: props.orderNumber }),
        });
        const json = await res.json();
        if (!cancelled) {
          if (!json.success || !json.clientSecret) {
            setError(json.message || 'Could not initialise payment');
          } else {
            setClientSecret(json.clientSecret);
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Network error');
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [props.orderNumber]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
        <i className="ri-error-warning-line text-2xl text-red-500 mb-2 block" aria-hidden></i>
        <p className="text-sm font-semibold text-red-800">Payment unavailable</p>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-ink-500">
        <i className="ri-loader-4-line animate-spin text-3xl text-sienna-500 mb-3" aria-hidden></i>
        <p className="text-sm">Securing your payment…</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        clientSecret,
        appearance,
        loader: 'auto',
      }}
    >
      <InnerForm {...props} />
    </Elements>
  );
}

function InnerForm({ total, currency, returnUrl }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // If we land here, confirmPayment failed before the redirect — the
    // user is still on this page. Surface the error inline.
    if (stripeError) {
      setError(
        stripeError.type === 'card_error' || stripeError.type === 'validation_error'
          ? stripeError.message || 'Payment could not be confirmed'
          : 'Something went wrong. Please try again.',
      );
      setSubmitting(false);
    }
  }

  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(total);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-ink-900 hover:bg-sienna-500 text-cream-50 px-7 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <i className="ri-loader-4-line animate-spin text-base" aria-hidden></i>
            Processing…
          </>
        ) : (
          <>
            <i className="ri-secure-payment-line text-base" aria-hidden></i>
            Pay {formatted}
          </>
        )}
      </button>

      <p className="text-[11px] tracking-wide text-ink-500 text-center flex items-center justify-center gap-1.5">
        <i className="ri-lock-line" aria-hidden></i>
        Secured by Stripe · PCI compliant · Cards, Apple Pay, Google Pay, Link
      </p>
    </form>
  );
}
