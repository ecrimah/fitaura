'use client';

import { useState } from 'react';
import type { HomepageTestimonial } from '@/lib/homepage-content';

interface TestimonialStripProps {
  testimonials: HomepageTestimonial[];
}

export default function TestimonialStrip({ testimonials }: TestimonialStripProps) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  if (total === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);
  const t = testimonials[current];

  return (
    <section className="bg-ink-900 text-cream-50 py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          <button
            onClick={prev}
            disabled={total < 2}
            className="hidden lg:flex lg:col-span-1 items-center justify-start text-cream-100/60 hover:text-sienna-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous testimonial"
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>

          <div className="lg:col-span-7">
            <span className="text-sienna-500 font-display text-4xl leading-none block mb-4" aria-hidden>“</span>
            <p className="font-display text-2xl sm:text-3xl lg:text-[34px] leading-[1.25] tracking-tight text-cream-50 max-w-2xl">
              {t.quote}
            </p>
          </div>

          <div className="lg:col-span-3 flex items-center gap-4 lg:justify-end lg:text-right">
            <div className="w-12 h-12 rounded-full bg-cream-200 flex-shrink-0 overflow-hidden ring-1 ring-cream-100/20">
              {t.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote avatar from CMS, kept simple
                <img src={t.avatarUrl} alt={`${t.author} avatar`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sienna-300 to-sienna-600" aria-hidden />
              )}
            </div>
            <div className="lg:order-first">
              <div className="text-sm font-semibold tracking-[0.15em] uppercase text-cream-50">— {t.author}</div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-cream-100/60 mt-1">{t.meta}</div>
              <div className="flex gap-0.5 mt-2 lg:justify-end" aria-label={`Rating: ${t.rating} out of 5`}>
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`ri-star-fill text-sm ${i < t.rating ? 'text-sienna-500' : 'text-cream-100/20'}`}
                    aria-hidden
                  ></i>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={next}
            disabled={total < 2}
            className="hidden lg:flex lg:col-span-1 items-center justify-end text-cream-100/60 hover:text-sienna-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next testimonial"
          >
            <i className="ri-arrow-right-line text-2xl"></i>
          </button>

          {total > 1 && (
            <div className="flex lg:hidden items-center justify-center gap-6 mt-2">
              <button onClick={prev} className="text-cream-100/60 hover:text-sienna-500 transition-colors" aria-label="Previous testimonial">
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <span className="text-[11px] tracking-[0.2em] uppercase text-cream-100/40">
                {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <button onClick={next} className="text-cream-100/60 hover:text-sienna-500 transition-colors" aria-label="Next testimonial">
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
