import Link from 'next/link';
import Image from 'next/image';

// Metadata is defined on the matching `layout.tsx` so we have one
// canonical source per page. Keep this file as a pure UI component.

const PILLARS = [
  {
    icon: 'ri-leaf-line',
    title: 'Considered Fabrics',
    body: 'We work with recycled nylon, organic cotton blends and OEKO-TEX certified knits — chosen for hand-feel, durability and lower environmental load.',
  },
  {
    icon: 'ri-recycle-line',
    title: 'Less Waste, By Design',
    body: 'Small-batch production. Pre-orders for limited drops. Off-cuts re-used for accessory linings. We make what people will actually wear.',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Ethical Manufacturing',
    body: 'Partner mills audited for fair wages and safe conditions. Long-term relationships over the cheapest quote — always.',
  },
  {
    icon: 'ri-truck-line',
    title: 'Cleaner Logistics',
    body: 'Shipped in recyclable mailers and minimal-ink hangtags. Calgary-based fulfillment to shorten the route to your door.',
  },
];

const COMMITMENTS = [
  'Phase out virgin polyester from the activewear line by end of 2027.',
  'Publish an annual transparency report — suppliers, materials, footprint, the honest stuff.',
  'Offer a take-back program: send well-loved FITAURA pieces home for repair, resale or recycling.',
  'Donate end-of-season samples to local Calgary athletics programs instead of landfill.',
];

export default function SustainabilityPage() {
  return (
    <div className="bg-cream-50 text-ink-700">

      {/* ─── Hero ─── */}
      <section className="relative w-full bg-cream-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[60vh] py-16 lg:py-20">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <span className="eyebrow mb-5 block">Sustainability</span>
              <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] text-ink-900 tracking-tight">
                <span className="block">WORN FOR YEARS,</span>
                <span className="block text-sienna-500">NOT SEASONS.</span>
              </h1>
              <p className="mt-7 text-ink-500 leading-relaxed max-w-md text-base">
                Sustainability at FITAURA isn&rsquo;t a marketing line — it&rsquo;s the only way the brand makes sense. Better fabric, smaller runs, longer life. Honest about the work that&rsquo;s done, and the work still ahead.
              </p>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[5/6] sm:aspect-[6/7] lg:aspect-[5/6] w-full overflow-hidden bg-cream-200">
                <Image
                  src="/brand/hero-3.jpg"
                  alt="FITAURA sustainability portrait"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pillars ─── */}
      <section className="bg-cream-50 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <span className="eyebrow mb-4 block">Our Pillars</span>
            <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] leading-[0.95] text-ink-900 tracking-tight">
              <span className="block">FOUR PRINCIPLES.</span>
              <span className="block text-sienna-500">EVERY PIECE.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {PILLARS.map((p) => (
              <article key={p.title}>
                <span className="inline-flex w-12 h-12 rounded-full border border-ink-300 items-center justify-center text-ink-700 mb-6">
                  <i className={`${p.icon} text-xl`} aria-hidden></i>
                </span>
                <h3 className="text-[13px] font-semibold tracking-[0.22em] uppercase text-ink-900 mb-3">
                  {p.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Commitments ─── */}
      <section className="bg-cream-100 py-16 lg:py-24 border-t border-cream-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <span className="eyebrow mb-4 block">What&rsquo;s Next</span>
              <h2 className="font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-[0.95] text-ink-900 tracking-tight">
                <span className="block">PROMISES</span>
                <span className="block text-sienna-500">ON THE TABLE.</span>
              </h2>
              <p className="mt-6 text-ink-500 leading-relaxed text-base max-w-sm">
                We&rsquo;d rather under-promise and over-deliver. These are the targets we&rsquo;re holding ourselves to between now and 2028.
              </p>
            </div>
            <ul className="lg:col-span-7 space-y-5 lg:space-y-6">
              {COMMITMENTS.map((c, i) => (
                <li key={c} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full border border-sienna-500/40 text-sienna-500 flex items-center justify-center font-display text-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-ink-700 leading-relaxed text-[16px] pt-1">{c}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-ink-900 text-cream-50 py-20 lg:py-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <span className="eyebrow text-sienna-500 mb-5 block">Designed In Calgary</span>
          <h2 className="font-display text-[40px] sm:text-[54px] lg:text-[64px] leading-[0.95] tracking-tight mb-6">
            <span className="block">BUY LESS.</span>
            <span className="block text-sienna-500">WEAR LONGER.</span>
          </h2>
          <p className="text-cream-100/70 leading-relaxed text-[17px] max-w-xl mx-auto mb-10">
            The most sustainable garment is the one you keep wearing. We build for that — and we&rsquo;re here when yours needs a repair, a re-home, or a recycle.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
            >
              Shop The Edit
            </Link>
            <Link
              href="/care-guide"
              className="inline-flex items-center justify-center border border-cream-50/40 hover:bg-cream-50 hover:text-ink-900 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
            >
              Care Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
