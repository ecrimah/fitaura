'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroSlide } from '@/lib/homepage-content';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

/**
 * Full-bleed editorial hero.
 *
 * The image fills the entire section (no split grid). A warm cream gradient
 * scrim on the left side guarantees text legibility while letting the model
 * remain in full view on the right. Mobile flips the gradient to bottom-up.
 */
export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative w-full h-[64vh] sm:h-[78vh] lg:h-[88vh] min-h-[460px] sm:min-h-[560px] max-h-[920px] overflow-hidden bg-cream-100">
      {/* ── Image layer: full-bleed, edge to edge ── */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            current === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={current !== idx}
        >
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover object-[70%_center] sm:object-[68%_center] lg:object-[65%_center]"
          />
        </div>
      ))}

      {/* ── Mobile-only bottom scrim ──
           On mobile the text block overlays the model directly, so a soft
           bottom-up fade is needed for legibility. Desktop has plenty of
           negative space on the left of every editorial frame, so no scrim
           is applied there — the photo stays at full clarity. */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-2/3 bg-gradient-to-t from-cream-50/85 via-cream-50/30 to-transparent lg:hidden" />

      {/* ── Content overlay ── */}
      <div className="absolute inset-0 z-30 flex items-end lg:items-center pointer-events-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full pb-8 sm:pb-12 lg:pb-0 pointer-events-auto">
          <div className="relative max-w-md sm:max-w-lg lg:max-w-xl">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`transition-all duration-700 ease-out ${
                  current === idx
                    ? 'opacity-100 translate-y-0 relative'
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
                aria-hidden={current !== idx}
              >
                <span className="eyebrow mb-3 sm:mb-5 block text-ink-700">{slide.eyebrow}</span>
                <h1
                  data-hero-headline
                  className="font-display text-[38px] sm:text-[60px] md:text-[76px] lg:text-[92px] xl:text-[104px] leading-[0.9] text-ink-900 tracking-tight"
                >
                  <span className="block">{slide.headlineTop}</span>
                  <span className="block text-sienna-500">{slide.headlineBottom}</span>
                </h1>
                <p className="mt-4 sm:mt-6 max-w-md text-ink-700 text-[14px] sm:text-[17px] leading-relaxed">
                  {slide.copy}
                </p>
                <div className="mt-5 sm:mt-8 lg:mt-10 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.primary.href}
                    className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
                  >
                    {slide.primary.label}
                  </Link>
                  <Link
                    href={slide.secondary.href}
                    className="inline-flex items-center justify-center border border-ink-900 hover:bg-ink-900 hover:text-cream-50 text-ink-900 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
                  >
                    {slide.secondary.label}
                  </Link>
                </div>
              </div>
            ))}

            {/* Slide indicators — sit at the foot of the content column,
                stable across slide transitions (no fade-in/out). */}
            {slides.length > 1 && (
              <div className="mt-6 sm:mt-10 lg:mt-14 flex items-center gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className="group flex items-center gap-2"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <span
                      className={`text-[11px] font-semibold tracking-[0.2em] transition-colors ${
                        current === idx ? 'text-sienna-500' : 'text-ink-400 group-hover:text-ink-700'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`h-px transition-all duration-500 ${
                        current === idx
                          ? 'w-10 bg-sienna-500'
                          : 'w-5 bg-ink-300 group-hover:bg-ink-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
