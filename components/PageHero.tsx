import React from 'react';
import Image from 'next/image';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    /**
     * Sienna kicker text shown above the headline. Defaults to a
     * generic "FITAURA · YYC" — pages can pass something more specific
     * (e.g. "The Edit", "Visit The Studio") to keep the editorial tone.
     */
    eyebrow?: string;
}

/**
 * PageHero
 *
 * Editorial hero band used by Shop / Contact / Wishlist / Cart — and any
 * other secondary page that needs a branded opener. Mirrors the rhythm
 * of the Categories and Journal hero so the typography reads as one
 * consistent voice site-wide:
 *
 *   - dark `bg-ink-900` surface with full-bleed image at `opacity-40`
 *     and a left-to-right gradient so the headline stays high-contrast
 *   - `py-16 lg:py-24` height (matches Shop / Collections / Journal)
 *   - sienna eyebrow + thin divider + uppercase meta line
 *   - `font-display text-[36→80px]` headline — no serif italic
 *   - lightweight subtitle in `text-cream-100/80`
 */
export default function PageHero({ title, subtitle, backgroundImage, eyebrow }: PageHeroProps) {
    const kicker = eyebrow ?? 'FITAURA · YYC';

    return (
        <section className="relative bg-ink-900 text-cream-50 overflow-hidden">
            {backgroundImage && (
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src={backgroundImage}
                        alt=""
                        aria-hidden
                        fill
                        priority
                        sizes="100vw"
                        quality={80}
                        className="object-cover object-center"
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />

            <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6 text-cream-100/80">
                        <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-sienna-500">
                            {kicker}
                        </span>
                        <span className="h-px w-12 bg-cream-100/40" />
                        <span className="text-[11px] tracking-[0.22em] uppercase">
                            Vol. {new Date().getFullYear()}
                        </span>
                    </div>

                    <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] tracking-tight">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-6 max-w-lg text-cream-100/80 text-sm lg:text-base leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
