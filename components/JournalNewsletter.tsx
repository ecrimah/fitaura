'use client';

import { useState, type FormEvent } from 'react';

/**
 * JournalNewsletter
 *
 * Visual-only signup used on the FITAURA Journal index. Submits to the
 * client-side simulator (no backend yet) and shows a confirmation. When
 * the marketing list is wired up (Resend / Mailchimp / Beehiiv etc.),
 * replace `simulateSubscribe` with a real fetch to the API route.
 */
async function simulateSubscribe(email: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 700));
  // Trivially valid email check — server is the source of truth.
  return { ok: /\S+@\S+\.\S+/.test(email) };
}

export default function JournalNewsletter() {
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

  if (status === 'success') {
    return (
      <div className="lg:col-span-5 bg-cream-50/5 border border-cream-50/15 px-5 py-6 text-center">
        <span className="inline-flex w-10 h-10 items-center justify-center bg-sienna-500 text-cream-50 rounded-full mb-3">
          <i className="ri-mail-check-line text-base" aria-hidden></i>
        </span>
        <p className="font-display text-lg text-cream-50 mb-1.5">You&rsquo;re in.</p>
        <p className="text-cream-100/70 text-[13px] leading-relaxed">
          Watch your inbox — the next FITAURA letter lands Sunday.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lg:col-span-5 flex flex-col gap-2.5" noValidate>
      <label htmlFor="journal-newsletter" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          id="journal-newsletter"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          placeholder="you@fitaura.ca"
          className="flex-1 bg-cream-50/10 border border-cream-50/20 px-4 py-3 text-cream-50 placeholder-cream-100/40 focus:outline-none focus:border-sienna-500 focus:bg-cream-50/15 transition-colors text-[13px] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-6 py-3 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <i className="ri-loader-4-line animate-spin text-base" aria-hidden></i>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      {status === 'error' ? (
        <p className="text-[10px] text-sienna-400 tracking-wide">
          Please enter a valid email address.
        </p>
      ) : (
        <p className="text-[10px] text-cream-100/50 tracking-wide">
          By subscribing you agree to receive FITAURA emails. Unsubscribe any time.
        </p>
      )}
    </form>
  );
}
