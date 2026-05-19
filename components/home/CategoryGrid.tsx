import Link from 'next/link';
import Image from 'next/image';
import { getHomepageCategories, type HomepageCategory } from '@/lib/homepage-content';

// Icon mapping kept in code — pure presentation, doesn't belong in the DB.
// Slugs not listed fall back to a generic shopping bag.
const ICON_MAP: Record<string, string> = {
  activewear: 'ri-shirt-line',
  loungewear: 'ri-shirt-line',
  accessories: 'ri-handbag-line',
  outerwear: 'ri-t-shirt-line',
  essentials: 'ri-shopping-bag-line',
};

// Fallback list used only when Supabase isn't reachable / categories are empty.
const FALLBACK: HomepageCategory[] = [
  { id: 'activewear', name: 'Activewear', slug: 'activewear', imageUrl: '/brand/hero-1.jpg' },
  { id: 'loungewear', name: 'Loungewear', slug: 'loungewear', imageUrl: '/brand/hero-2.jpg' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', imageUrl: '/brand/hero-3.jpg' },
  { id: 'outerwear', name: 'Outerwear', slug: 'outerwear', imageUrl: '/brand/shop-hero.jpg' },
  { id: 'essentials', name: 'Essentials', slug: 'essentials', imageUrl: '/brand/categories-hero.jpg' },
];

export default async function CategoryGrid() {
  const fetched = await getHomepageCategories(5);
  const categories = fetched.length ? fetched : FALLBACK;

  // Render the list twice so the CSS marquee can translate by -50% and
  // loop seamlessly. The duplicate copy is aria-hidden so screen readers
  // don't read the same links twice.
  const loop = [
    ...categories.map((c) => ({ ...c, _key: `a-${c.id}`, _clone: false })),
    ...categories.map((c) => ({ ...c, _key: `b-${c.id}`, _clone: true })),
  ];

  return (
    <section className="bg-cream-50 pt-10 pb-16 lg:pt-12 lg:pb-24">
      {/* Edge-to-edge: the fade mask + auto-scroll feel more cinematic
          when the track touches the viewport edges. */}
      <div className="marquee" style={{ ['--marquee-duration' as string]: '50s' }}>
        <ul className="marquee-track gap-4 lg:gap-5 px-4 sm:px-6 lg:px-10" role="list">
          {loop.map((category) => {
            const icon = ICON_MAP[category.slug] ?? 'ri-shopping-bag-line';
            return (
              <li
                key={category._key}
                className="shrink-0 w-[200px] sm:w-[240px] lg:w-[280px] xl:w-[320px]"
                aria-hidden={category._clone || undefined}
              >
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden bg-ink-700 isolate"
                  tabIndex={category._clone ? -1 : undefined}
                >
                  <Image
                    src={category.imageUrl}
                    alt={category._clone ? '' : category.name}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 320px"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink-900/55 group-hover:bg-ink-900/40 transition-colors duration-500" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-cream-50 px-3">
                    <i
                      className={`${icon} text-3xl lg:text-4xl mb-3 opacity-90 transition-transform duration-500 group-hover:-translate-y-1`}
                      aria-hidden
                    ></i>
                    <h3 className="font-display text-base sm:text-lg tracking-wider uppercase">
                      {category.name}
                    </h3>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                      Shop Now
                      <i
                        className="ri-arrow-right-line text-xs transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      ></i>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
