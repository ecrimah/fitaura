'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCMS } from '@/context/CMSContext';
import { usePageTitle } from '@/hooks/usePageTitle';

interface BrandStoryView {
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonUrl: string;
  valueProps: Array<{ icon: string; title: string; body: string }>;
}

const BRAND_STORY_FALLBACK: BrandStoryView = {
  eyebrow: 'Designed in Calgary',
  titleTop: 'BUILT FOR',
  titleBottom: 'EVERY AURA.',
  content:
    'FITAURA is a modern lifestyle clothing brand offering gymwear, athleisure and fashion-forward apparel — designed to empower confidence and comfort. Our roots are in performance, but our vision is bigger: a full wardrobe for every part of your day.',
  imageUrl: '/brand/about-hero.jpg',
  imageAlt: 'FITAURA brand portrait — built for every aura',
  buttonText: 'Shop The Collection',
  buttonUrl: '/shop',
  valueProps: [
    { icon: 'ri-pulse-line', title: 'Built To Move', body: 'Performance gymwear engineered for studio days and beyond.' },
    { icon: 'ri-sparkling-2-line', title: 'Fashion-Forward', body: 'Athleisure that wears just as well with denim and boots.' },
    { icon: 'ri-heart-3-line', title: 'Confidence In Comfort', body: 'Silhouettes designed to celebrate strength and ease.' },
  ],
};

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting, getContent } = useCMS();
  const siteName = getSetting('site_name') || 'FITAURA';

  // Brand story comes from the cms_content row (section=homepage, block_key=brand_story)
  // managed in /admin/content. Falls back to the hardcoded copy when the row hasn't been
  // seeded or Supabase is unreachable.
  const storyCms = getContent('homepage', 'brand_story');
  const storyMeta = (storyCms?.metadata ?? {}) as Record<string, unknown>;
  const rawValueProps = Array.isArray(storyMeta.value_props) ? (storyMeta.value_props as unknown[]) : [];
  const cmsValueProps = rawValueProps
    .map((p) => {
      const v = (p ?? {}) as Record<string, unknown>;
      return {
        icon: String(v.icon ?? ''),
        title: String(v.title ?? ''),
        body: String(v.body ?? ''),
      };
    })
    .filter((v) => v.title || v.body);

  const BRAND_STORY: BrandStoryView = storyCms
    ? {
        eyebrow: String(storyMeta.eyebrow ?? BRAND_STORY_FALLBACK.eyebrow),
        titleTop: storyCms.title || BRAND_STORY_FALLBACK.titleTop,
        titleBottom: storyCms.subtitle || BRAND_STORY_FALLBACK.titleBottom,
        content: storyCms.content || BRAND_STORY_FALLBACK.content,
        imageUrl: storyCms.image_url || BRAND_STORY_FALLBACK.imageUrl,
        imageAlt: String(storyMeta.image_alt ?? BRAND_STORY_FALLBACK.imageAlt),
        buttonText: storyCms.button_text || BRAND_STORY_FALLBACK.buttonText,
        buttonUrl: storyCms.button_url || BRAND_STORY_FALLBACK.buttonUrl,
        valueProps: cmsValueProps.length ? cmsValueProps : BRAND_STORY_FALLBACK.valueProps,
      }
    : BRAND_STORY_FALLBACK;

  return (
    <div className="bg-cream-50 text-ink-700">

      {/* ─── Brand story (now opens the About page) ─── */}
      {/* `bg-white` separates this opening band from the header, which sits
          on the page's cream-50 base. */}
      <section className="bg-white py-16 lg:py-24 border-b border-cream-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

          {/* Brand story — two-column block (copy + editorial image). */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left — copy */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <span className="eyebrow">{BRAND_STORY.eyebrow}</span>
                <span className="h-px w-12 bg-sienna-500/40" />
              </div>
              <h2 className="font-display text-[42px] sm:text-[54px] lg:text-[64px] leading-[0.92] text-ink-900 tracking-tight">
                <span className="block">{BRAND_STORY.titleTop}</span>
                <span className="block text-sienna-500">{BRAND_STORY.titleBottom}</span>
              </h2>
              <p className="mt-7 text-ink-500 leading-relaxed max-w-md">{BRAND_STORY.content}</p>
              {/*
                CTA is intentionally hardcoded here. The CMS row for
                `brand_story.button_*` still ships "Discover Our Story →
                /about" from when this content lived on the homepage —
                that doesn't make sense on the About page itself, so we
                always send visitors to the shop instead.
              */}
              <Link
                href="/shop"
                className="mt-9 inline-flex items-center bg-ink-900 hover:bg-sienna-500 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
              >
                Shop The Collection
              </Link>
            </div>

            {/* Right — editorial image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[5/4] w-full overflow-hidden bg-cream-200">
                <Image
                  src={BRAND_STORY.imageUrl}
                  alt={BRAND_STORY.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </div>

          </div>

          {/* Value props — sits beneath the brand-story block as a full-
              width horizontal row, matching the homepage ValuePropsStrip
              card language (white surface, rounded-xl, sienna chip,
              display title, gray body). */}
          <ul className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 lg:gap-5">
            {BRAND_STORY.valueProps.map((v) => (
              <li
                key={v.title}
                className="group relative overflow-hidden rounded-xl bg-white border border-cream-200 p-5 lg:p-6 transition-all duration-300 hover:border-sienna-200 hover:shadow-[0_14px_38px_-22px_rgba(209,79,43,0.35)] hover:-translate-y-0.5"
              >
                {/* Soft sienna wash fades in on hover — mirrors the
                    homepage trust cards. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sienna-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <div className="relative">
                  <span className="inline-flex w-10 h-10 items-center justify-center bg-sienna-500 text-cream-50 rounded-lg mb-4 transition-transform duration-300 group-hover:scale-[1.06]">
                    <i className={`${v.icon} text-base`} aria-hidden></i>
                  </span>
                  <h4 className="font-display text-[15px] lg:text-base text-ink-900 mb-2 tracking-tight">
                    {v.title}
                  </h4>
                  <p className="text-ink-500 leading-relaxed text-[13px]">
                    {v.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-ink-900 text-cream-50 py-14 lg:py-18">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <span className="eyebrow text-sienna-500 mb-4 block">Shop The Collection</span>
          <h2 className="font-display text-[28px] sm:text-[38px] lg:text-[48px] leading-[1] tracking-tight mb-5">
            <span className="block">CONFIDENCE</span>
            <span className="block text-sienna-500">IS A WARDROBE.</span>
          </h2>
          <p className="text-cream-100/70 leading-relaxed text-[14.5px] lg:text-[15px] max-w-lg mx-auto mb-7">
            New arrivals every season. Lounge sets that live in your suitcase. Accessories that finish every look. Built for every part of your day.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
