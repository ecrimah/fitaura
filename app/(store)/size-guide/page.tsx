'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type TabId = 'tops' | 'bottoms' | 'sports-bras' | 'accessories';

interface SizeRow {
  size: string;
  bust?: string;
  waist?: string;
  hip?: string;
  under_bust?: string;
  length?: string;
}

interface SizeTable {
  id: TabId;
  label: string;
  intro: string;
  columns: { key: keyof SizeRow; label: string }[];
  rows: SizeRow[];
}

const TABLES: SizeTable[] = [
  {
    id: 'tops',
    label: 'Tops & Loungewear',
    intro: 'Crop tops, tees, hoodies and lounge sets. Measure across the fullest part of your bust and around your natural waist.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'bust', label: 'Bust (in)' },
      { key: 'waist', label: 'Waist (in)' },
      { key: 'length', label: 'Body Length (in)' },
    ],
    rows: [
      { size: 'XS',  bust: '31–32', waist: '24–25', length: '22' },
      { size: 'S',   bust: '33–34', waist: '26–27', length: '22.5' },
      { size: 'M',   bust: '35–36', waist: '28–29', length: '23' },
      { size: 'L',   bust: '37–39', waist: '30–32', length: '23.5' },
      { size: 'XL',  bust: '40–42', waist: '33–35', length: '24' },
      { size: 'XXL', bust: '43–45', waist: '36–38', length: '24.5' },
    ],
  },
  {
    id: 'bottoms',
    label: 'Leggings & Shorts',
    intro: 'Engineered for a sculpted, true-to-size fit. If you sit between two sizes, size up for comfort or down for compression.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'waist', label: 'Waist (in)' },
      { key: 'hip', label: 'Hip (in)' },
      { key: 'length', label: 'Inseam (in)' },
    ],
    rows: [
      { size: 'XS',  waist: '24–25', hip: '34–35', length: '26' },
      { size: 'S',   waist: '26–27', hip: '36–37', length: '26.5' },
      { size: 'M',   waist: '28–29', hip: '38–39', length: '27' },
      { size: 'L',   waist: '30–32', hip: '40–42', length: '27.5' },
      { size: 'XL',  waist: '33–35', hip: '43–45', length: '28' },
      { size: 'XXL', waist: '36–38', hip: '46–48', length: '28.5' },
    ],
  },
  {
    id: 'sports-bras',
    label: 'Sports Bras',
    intro: 'Measure your under-bust snugly and your bust loosely. For low-impact bras choose your usual size; for high-impact, size down for support.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'under_bust', label: 'Under-Bust (in)' },
      { key: 'bust', label: 'Bust (in)' },
    ],
    rows: [
      { size: 'XS',  under_bust: '26–28', bust: '31–32' },
      { size: 'S',   under_bust: '28–30', bust: '33–34' },
      { size: 'M',   under_bust: '30–32', bust: '35–36' },
      { size: 'L',   under_bust: '32–34', bust: '37–39' },
      { size: 'XL',  under_bust: '34–36', bust: '40–42' },
      { size: 'XXL', under_bust: '36–38', bust: '43–45' },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    intro: 'Caps, headbands and bags are typically one-size. Belts and gloves follow the standard XS–XXL chart below.',
    columns: [
      { key: 'size', label: 'Size' },
      { key: 'waist', label: 'Waist (in) — belts' },
      { key: 'bust', label: 'Hand Circumference (in) — gloves' },
    ],
    rows: [
      { size: 'XS / S', waist: '25–28', bust: '6.5–7' },
      { size: 'M',      waist: '29–31', bust: '7–7.5' },
      { size: 'L',      waist: '32–34', bust: '7.5–8' },
      { size: 'XL / XXL', waist: '35–38', bust: '8–8.5' },
    ],
  },
];

const TIPS = [
  {
    icon: 'ri-ruler-line',
    title: 'Measure Over Light Layers',
    body: 'Wear a thin tee or measure directly over skin — heavy clothing throws the tape off.',
  },
  {
    icon: 'ri-loader-line',
    title: 'Keep The Tape Level',
    body: 'Tape should be parallel to the floor and snug, not tight. Breathe normally while you measure.',
  },
  {
    icon: 'ri-magic-line',
    title: 'Trust The Larger Number',
    body: 'When your bust, waist and hip fall into different sizes, choose the largest one. The fabric will do the rest.',
  },
];

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<TabId>('tops');
  const table = TABLES.find((t) => t.id === activeTab)!;

  return (
    <div className="bg-cream-50 text-ink-700">

      {/* ─── Hero ─── */}
      <section className="relative w-full bg-cream-100 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[50vh] py-14 lg:py-20">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <span className="eyebrow mb-5 block">Size Guide</span>
              <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] text-ink-900 tracking-tight">
                <span className="block">FIND YOUR</span>
                <span className="block text-sienna-500">PERFECT FIT.</span>
              </h1>
              <p className="mt-7 text-ink-500 leading-relaxed max-w-md text-base">
                Every FITAURA piece is engineered to move with you. Use the tables below to find your size — and remember, fit is personal. Reach out if you&rsquo;re ever between sizes.
              </p>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[5/6] sm:aspect-[6/7] lg:aspect-[5/6] w-full overflow-hidden bg-cream-200">
                <Image
                  src="/brand/hero-2.jpg"
                  alt="FITAURA fit and measurement"
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

      {/* ─── Size tables ─── */}
      <section className="bg-cream-50 py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="border-b border-cream-200 mb-8 overflow-x-auto">
            <nav className="flex gap-8 min-w-max">
              {TABLES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-4 text-[11px] font-semibold tracking-[0.22em] uppercase transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === t.id
                      ? 'border-sienna-500 text-sienna-500'
                      : 'border-transparent text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <p className="text-ink-500 leading-relaxed text-base max-w-2xl mb-8">{table.intro}</p>

          <div className="overflow-x-auto bg-cream-100 border border-cream-200">
            <table className="w-full text-left">
              <thead className="bg-ink-900 text-cream-50">
                <tr>
                  {table.columns.map((col) => (
                    <th key={col.key} className="px-5 py-4 text-[11px] tracking-[0.22em] uppercase font-semibold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {table.rows.map((row) => (
                  <tr key={row.size} className="hover:bg-cream-50 transition-colors">
                    {table.columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-4 text-ink-700 ${col.key === 'size' ? 'font-display tracking-wider text-ink-900' : ''}`}
                      >
                        {row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-ink-500 text-sm mt-4">
            Measurements are body measurements, not garment measurements. Add 1–2 in for a relaxed fit.
          </p>
        </div>
      </section>

      {/* ─── How to measure ─── */}
      <section className="bg-cream-100 py-16 lg:py-20 border-t border-cream-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10">
          <span className="eyebrow mb-4 block">How To Measure</span>
          <h2 className="font-display text-[32px] sm:text-[42px] lg:text-[48px] leading-[0.95] text-ink-900 tracking-tight max-w-xl">
            <span className="block">THREE TIPS.</span>
            <span className="block text-sienna-500">EVERY TIME.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 mt-12">
            {TIPS.map((tip) => (
              <article key={tip.title}>
                <span className="inline-flex w-12 h-12 rounded-full border border-ink-300 items-center justify-center text-ink-700 mb-5">
                  <i className={`${tip.icon} text-xl`} aria-hidden></i>
                </span>
                <h3 className="text-[12px] font-semibold tracking-[0.22em] uppercase text-ink-900 mb-3">{tip.title}</h3>
                <p className="text-ink-500 leading-relaxed text-[15px]">{tip.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-ink-900 text-cream-50 py-20 lg:py-24">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <span className="eyebrow text-sienna-500 mb-5 block">Still Unsure?</span>
          <h2 className="font-display text-[40px] sm:text-[54px] lg:text-[60px] leading-[0.95] tracking-tight mb-6">
            <span className="block">WE&rsquo;LL HELP YOU</span>
            <span className="block text-sienna-500">GET IT RIGHT.</span>
          </h2>
          <p className="text-cream-100/70 leading-relaxed text-[17px] max-w-xl mx-auto mb-10">
            Send us your measurements — we&rsquo;ll point you to the right size, the right cut and the right fabric weight. No guessing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
            >
              Ask Our Team
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center border border-cream-50/40 hover:bg-cream-50 hover:text-ink-900 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
            >
              Shop The Edit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
