'use client';

import { useState, type FormEvent } from 'react';

/**
 * JoinCommunity
 *
 * Homepage newsletter signup that replaces the previous testimonial
 * strip. Mirrors the reference layout exactly — centred icon chip,
 * display headline, supporting paragraph, pill-shaped email form —
 * but rebuilt in the FITAURA palette (ink-900 surface, sienna
 * accents, cream typography) instead of the reference's green.
 *
 * No backend yet: submission is simulated client-side so the form
 * always gives the user feedback. When a real list provider is wired
 * up (Resend audience, Mailchimp, Beehiiv…) swap the simulator for a
 * fetch to the API route — the component contract doesn't change.
 */
async function simulateSubscribe(email: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 700));
  return { ok: /\S+@\S+\.\S+/.test(email) };
}

export default function JoinCommunity() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    const res = await simulateSubscribe(email.trim());
    if (res.ok) {
      setStatus('success');
      setEmail('');
    } else {
      setStatus('error');
    }
  }

  return (
    <section className="relative bg-ink-900 text-cream-50 overflow-hidden py-14 lg:py-20">
      {/* Soft sienna radial glow — adds depth to the otherwise flat
          dark surface without competing with the form. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(209,79,43,0.18),transparent_55%)]"
      />

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-sienna-500/15 ring-1 ring-sienna-500/30 mb-5">
          <i className="ri-mail-star-line text-lg text-sienna-500" aria-hidden></i>
        </span>

        <h2 className="font-display text-[24px] sm:text-[30px] lg:text-[36px] leading-[1.1] tracking-tight">
          Join the FITAURA Community
        </h2>

        <p className="mt-3 text-cream-100/70 text-sm lg:text-[15px] leading-relaxed max-w-lg mx-auto">
          First access to new drops, private member sales, and dispatches
          from the Calgary studio — straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="mt-7 inline-flex flex-col items-center gap-1.5 px-5 py-4 bg-sienna-500/10 border border-sienna-500/30 rounded-full">
            <span className="inline-flex items-center gap-2 text-sienna-400 text-[12px] font-semibold tracking-[0.18em] uppercase">
              <i className="ri-checkbox-circle-fill text-sm" aria-hidden></i>
              You&rsquo;re in
            </span>
            <p className="text-cream-100/70 text-[12px]">
              Watch your inbox — the next FITAURA letter is on its way.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 mx-auto max-w-sm"
          >
            <label htmlFor="community-email" className="sr-only">
              Email address
            </label>
            <div className="flex items-center gap-2 p-1 rounded-full bg-cream-50/8 ring-1 ring-cream-50/15 focus-within:ring-sienna-500/60 transition-colors">
              <input
                id="community-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'submitting'}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none px-4 py-2.5 text-[13px] text-cream-50 placeholder-cream-100/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-5 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'submitting' ? (
                  <i className="ri-loader-4-line animate-spin text-sm" aria-hidden></i>
                ) : (
                  'Join'
                )}
              </button>
            </div>

            <p
              className={`mt-3 text-[10.5px] tracking-wide ${
                status === 'error' ? 'text-sienna-400' : 'text-cream-100/45'
              }`}
            >
              {status === 'error'
                ? 'Please enter a valid email address.'
                : 'By subscribing you agree to receive FITAURA emails. Unsubscribe anytime.'}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
