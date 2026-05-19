import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Care Guide — How to Keep Your FITAURA' },
  description: 'How to wash, dry and store your FITAURA pieces so they keep their shape, stretch and colour for years.',
};

const STEPS = [
  {
    n: '01',
    title: 'Wash Cold, Inside Out',
    body: 'Turn garments inside out and wash on a cold, delicate cycle (max 30°C / 86°F). Hot water breaks down elastane and fades pigment over time.',
  },
  {
    n: '02',
    title: 'Use A Mild Detergent',
    body: 'Skip the fabric softener, bleach and optical brighteners — they coat the fibre, kill stretch and accelerate pilling. A small dose of mild liquid detergent is all you need.',
  },
  {
    n: '03',
    title: 'Group By Colour',
    body: 'Wash darks with darks and brights with brights — especially Sienna, Mocha and Dark Brown for the first three washes.',
  },
  {
    n: '04',
    title: 'Air Dry, Lay Flat',
    body: 'Lay activewear and knits flat on a towel. Hang lounge sets on a line, away from direct sun. Tumble drying is the single fastest way to ruin a good legging.',
  },
  {
    n: '05',
    title: 'Iron On Low (If You Must)',
    body: 'Most FITAURA pieces don&rsquo;t need ironing. If you do, use the lowest setting, inside out, and never iron logos or graphic prints.',
  },
  {
    n: '06',
    title: 'Store Folded, Not Hung',
    body: 'Knitwear and stretch fabrics deform on hangers. Fold them. Hang only the structured pieces (jackets, woven shirts).',
  },
];

const DO_DONT = {
  do: [
    'Wash inside out on cold, delicate cycle',
    'Use a mild liquid detergent',
    'Air dry flat, away from direct sun',
    'Spot-clean stains within 24 hours',
    'Wash a new piece before first wear',
  ],
  dont: [
    'Use fabric softener or bleach',
    'Tumble dry on heat',
    'Iron over logos, prints or seams',
    'Store damp or rolled up in a gym bag',
    'Wash with denim or velcro — they snag knits',
  ],
};

export default function CareGuidePage() {
  return (
    <div className="bg-cream-50 text-ink-700">

      {/* ─── Hero ─── */}
      <section className="relative w-full bg-cream-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[55vh] py-14 lg:py-20">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <span className="eyebrow mb-5 block">Care Guide</span>
              <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] text-ink-900 tracking-tight">
                <span className="block">MADE TO LAST.</span>
                <span className="block text-sienna-500">KEEP IT THAT WAY.</span>
              </h1>
              <p className="mt-7 text-ink-500 leading-relaxed max-w-md text-base">
                The right wash, the right dry, the right fold. Six small habits that keep your FITAURA pieces feeling new — workout after workout, season after season.
              </p>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[5/6] sm:aspect-[6/7] lg:aspect-[5/6] w-full overflow-hidden bg-cream-200">
                <Image
                  src="/brand/about-hero.jpg"
                  alt="FITAURA care guide"
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

      {/* ─── Steps ─── */}
      <section className="bg-cream-50 py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-12 lg:mb-16 max-w-2xl">
            <span className="eyebrow mb-4 block">Six Steps</span>
            <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] leading-[0.95] text-ink-900 tracking-tight">
              <span className="block">THE FITAURA</span>
              <span className="block text-sienna-500">WASH RITUAL.</span>
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10 lg:gap-y-12">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-5">
                <span className="flex-shrink-0 font-display text-3xl text-sienna-500 leading-none w-12">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold tracking-[0.22em] uppercase text-ink-900 mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-ink-500 leading-relaxed text-[15px]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Do / Don't ─── */}
      <section className="bg-cream-100 py-16 lg:py-20 border-t border-cream-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <article>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-sienna-500 text-cream-50">
                  <i className="ri-check-line text-lg" aria-hidden></i>
                </span>
                <h3 className="font-display text-2xl tracking-tight text-ink-900">DO</h3>
              </div>
              <ul className="space-y-3">
                {DO_DONT.do.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-700 text-[15px] leading-relaxed">
                    <i className="ri-checkbox-circle-line text-sienna-500 mt-1" aria-hidden></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-ink-900 text-cream-50">
                  <i className="ri-close-line text-lg" aria-hidden></i>
                </span>
                <h3 className="font-display text-2xl tracking-tight text-ink-900">DON&rsquo;T</h3>
              </div>
              <ul className="space-y-3">
                {DO_DONT.dont.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-700 text-[15px] leading-relaxed">
                    <i className="ri-close-circle-line text-ink-900 mt-1" aria-hidden></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ─── Repair / Repurpose ─── */}
      <section className="bg-cream-50 py-16 lg:py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="eyebrow mb-4 block">Repair, Re-Home, Recycle</span>
            <h2 className="font-display text-[32px] sm:text-[42px] lg:text-[48px] leading-[0.95] text-ink-900 tracking-tight">
              <span className="block">PIECES DESERVE</span>
              <span className="block text-sienna-500">A SECOND LIFE.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 text-ink-500 leading-relaxed space-y-4 text-[15px]">
            <p>
              If a seam goes or a drawstring frays, send us a note before you toss it. We offer free repair on construction faults inside the first year, and reasonable repair pricing after that.
            </p>
            <p>
              Outgrown a piece? Our take-back program (launching 2027) will resell it, repair it for donation, or recycle the fibres back into new fabric — depending on its condition.
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center bg-ink-900 hover:bg-sienna-500 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-ink-900 text-cream-50 py-20 lg:py-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <span className="eyebrow text-sienna-500 mb-5 block">Built To Last</span>
          <h2 className="font-display text-[40px] sm:text-[54px] lg:text-[60px] leading-[0.95] tracking-tight mb-6">
            <span className="block">CARE FOR IT.</span>
            <span className="block text-sienna-500">IT&rsquo;LL CARE FOR YOU.</span>
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
          >
            Shop The Edit
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
