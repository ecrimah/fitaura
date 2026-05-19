import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  position: number | null;
};

/**
 * Editorial copy tokens layered ON TOP of the DB row.
 *
 * The DB only stores a single short description per category. For the
 * magazine-style showcase we want a stronger voice + a sub-line. These tokens
 * live in code (presentation), keyed by slug. Missing slugs fall back cleanly
 * to the DB description.
 */
const EDITORIAL: Record<
  string,
  { tagline: string; quote: string; intent: string }
> = {
  activewear: {
    tagline: 'Engineered to move with you.',
    quote: 'Built for studio days, long runs, and the bits in between.',
    intent: 'Performance',
  },
  loungewear: {
    tagline: 'Soft armour for slow mornings.',
    quote: 'Sculpted knits, lived-in silhouettes, Calgary-cool palette.',
    intent: 'Lifestyle',
  },
  accessories: {
    tagline: 'The finishing line.',
    quote: 'Caps, bags and small details that complete every look.',
    intent: 'Detail',
  },
  outerwear: {
    tagline: 'Layers built for the in-between.',
    quote: 'Studio-to-street pieces that hold their shape and their story.',
    intent: 'Transition',
  },
  essentials: {
    tagline: 'Reimagined wardrobe staples.',
    quote: 'The basics, rebuilt in the FITAURA palette — quietly considered.',
    intent: 'Foundation',
  },
};

const FALLBACK_INTENT = 'Edit';

export default async function CollectionsPage() {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, position')
    .eq('status', 'active')
    .order('position', { ascending: true });

  const categories: CategoryRow[] = data ?? [];
  const hasCategories = categories.length > 0;

  return (
    <main className="bg-cream-50 text-ink-900">

      {/* ─────────────────────────────────────────────────────────────
          1 · EDITORIAL MASTHEAD
          Full-bleed dark hero. Establishes the "magazine issue" tone
          set on the homepage and About page.
          ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-cream-50 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/brand/categories-hero.jpg"
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6 text-cream-100/80">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.26em] sm:tracking-[0.28em] uppercase text-sienna-500">
                  The Collections
                </span>
                <span className="h-px w-10 sm:w-12 bg-cream-100/40" />
                <span className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase">Vol. 01</span>
              </div>
              <h1 className="font-display text-[30px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] tracking-tight">
                <span className="block">WORLDS WITHIN</span>
                <span className="block text-sienna-500">A WARDROBE.</span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-lg text-cream-100/80 text-[13px] sm:text-sm lg:text-base leading-relaxed">
                Five edits, one wardrobe. Each FITAURA collection is built around a
                single question — how do you want to move through your day?
              </p>
              <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-5 sm:px-7 py-3 sm:py-3.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] sm:tracking-[0.24em] uppercase transition-colors duration-300"
                >
                  Shop Everything
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="inline-flex items-center border border-cream-50/60 hover:bg-cream-50 hover:text-ink-900 text-cream-50 px-5 sm:px-7 py-3 sm:py-3.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] sm:tracking-[0.24em] uppercase transition-colors duration-300"
                >
                  Just In
                </Link>
              </div>
            </div>

            {/* Stats aside — hidden below `lg:` to keep the mobile hero
                tight. On desktop it sits to the right of the copy block. */}
            <aside className="hidden lg:block lg:col-span-4 lg:pl-10 lg:border-l lg:border-cream-100/15">
              <dl className="grid grid-cols-2 gap-y-5 gap-x-6 text-cream-100/80">
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Edits</dt>
                  <dd className="font-display text-2xl text-cream-50">
                    {String(categories.length).padStart(2, '0')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Origin</dt>
                  <dd className="font-display text-2xl text-cream-50">YYC</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Released</dt>
                  <dd className="font-display text-2xl text-cream-50">2026</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Shipping</dt>
                  <dd className="font-display text-2xl text-cream-50">CA · US</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2 · COLLECTIONS GRID
          A tight 4-column grid of editorial cards. Each tile keeps the
          collection's number + intent badge so the editorial language
          carries through, but at a much more compact scale than the
          previous full-bleed showcase.
          ─────────────────────────────────────────────────────────── */}
      {hasCategories ? (
        <section className="bg-cream-50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
            <div className="flex items-end justify-between flex-wrap gap-6 mb-10 lg:mb-12">
              <div>
                <span className="eyebrow mb-3 block">Contents</span>
                <h2 className="font-display text-[32px] sm:text-[40px] lg:text-[48px] leading-[0.95] tracking-tight">
                  THE INDEX.
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-ink-900 text-[11px] font-semibold tracking-[0.24em] uppercase hover:text-sienna-500 transition-colors"
              >
                View All Products <i className="ri-arrow-right-line" aria-hidden></i>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {categories.map((category, idx) => {
                const editorial = EDITORIAL[category.slug];
                const number = String(idx + 1).padStart(2, '0');
                const intent = editorial?.intent ?? FALLBACK_INTENT;
                const image = category.image_url || '/brand/hero-1.jpg';

                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group relative aspect-[4/5] overflow-hidden bg-ink-700 isolate"
                  >
                    <Image
                      src={image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-ink-900/55 group-hover:bg-ink-900/35 transition-colors duration-500" />

                    <div className="absolute inset-0 p-4 lg:p-5 flex flex-col text-cream-50">
                      <div className="flex items-center justify-between text-[9px] lg:text-[10px] tracking-[0.24em] uppercase opacity-90">
                        <span>{number}</span>
                        <span className="truncate ml-2">{intent}</span>
                      </div>
                      <div className="mt-auto">
                        <h3 className="font-display text-xl sm:text-2xl lg:text-[26px] tracking-tight leading-[0.95]">
                          {category.name}
                        </h3>
                        <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                          Shop Edit
                          <i className="ri-arrow-right-line text-xs transition-transform duration-300 group-hover:translate-x-1" aria-hidden></i>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        // ── Empty state ── shouldn't ever render in production but kept
        // for safety so the page still has something to say.
        <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-cream-200 text-ink-500 mb-6">
            <i className="ri-inbox-line text-2xl" aria-hidden></i>
          </span>
          <h2 className="font-display text-3xl mb-3">Collections coming soon</h2>
          <p className="text-ink-500 max-w-md mx-auto">
            We&rsquo;re finalising the season. Browse the full shop while we set the
            collections up.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
          >
            Browse The Shop
          </Link>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3 · "CAN'T FIND IT" CTA
          Cleaner re-cut of the old sienna gradient banner — now sits
          on cream-50 with a tight two-column layout instead of a loud
          coloured strip. Search + Contact as parallel actions.
          ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="eyebrow mb-4 block">Personal styling</span>
              <h2 className="font-display text-[36px] sm:text-[48px] lg:text-[58px] leading-[0.95] tracking-tight text-ink-900">
                <span className="block">CAN&rsquo;T FIND</span>
                <span className="block text-sienna-500">YOUR AURA?</span>
              </h2>
              <p className="mt-6 text-ink-500 leading-relaxed text-base lg:text-lg max-w-lg">
                Tell us how you move and we&rsquo;ll curate your edit — sizing,
                styling and recommendations from the FITAURA team.
              </p>
            </div>
            <div className="lg:col-span-5 lg:pl-10 lg:border-l lg:border-ink-200">
              <div className="flex flex-col gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-between gap-3 bg-ink-900 hover:bg-sienna-500 text-cream-50 px-6 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
                >
                  <span className="flex items-center gap-3">
                    <i className="ri-search-line text-base" aria-hidden></i>
                    Search All Products
                  </span>
                  <i className="ri-arrow-right-line text-base" aria-hidden></i>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-between gap-3 border border-ink-900 hover:bg-ink-900 hover:text-cream-50 text-ink-900 px-6 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
                >
                  <span className="flex items-center gap-3">
                    <i className="ri-customer-service-2-line text-base" aria-hidden></i>
                    Talk To The Studio
                  </span>
                  <i className="ri-arrow-right-line text-base" aria-hidden></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
