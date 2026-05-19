import Link from 'next/link';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import JournalNewsletter from '@/components/JournalNewsletter';

export const revalidate = 60;

interface PublicBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  reading_minutes?: number | null;
}

async function getPosts(): Promise<PublicBlogPost[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, featured_image, tags, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false });
    if (error || !data) return [];
    return data as PublicBlogPost[];
  } catch {
    return [];
  }
}

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function readTime(excerpt: string | null): string {
  const words = (excerpt ?? '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 80));
  return `${minutes} min read`;
}

export default async function JournalPage() {
  const posts = await getPosts();
  const featured = posts[0];
  const aboveFold = posts.slice(1, 4);
  const archive = posts.slice(4);

  // Collect distinct tags for the topic rail. Cap at 8 for visual balance.
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? []).filter(Boolean) as string[]),
  ).slice(0, 8);

  // Year of the first published post — used in the masthead "Vol." line.
  const firstPostYear = posts.length
    ? new Date(posts[posts.length - 1].published_at ?? posts[posts.length - 1].created_at).getFullYear()
    : new Date().getFullYear();
  const currentYear = new Date().getFullYear();

  return (
    <main className="bg-cream-50 text-ink-900">

      {/* ─────────────────────────────────────────────────────────────
          1 · MASTHEAD
          Editorial hero band — matches the Shop & Collections hero
          rhythm: dark `bg-ink-900` surface, full-bleed image with a
          gradient overlay, condensed `py-16 lg:py-24` height.
          ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-900 text-cream-50 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/brand/hero-2.jpg"
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6 text-cream-100/80">
                <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-sienna-500">
                  The FITAURA Journal
                </span>
                <span className="h-px w-12 bg-cream-100/40" />
                <span className="text-[11px] tracking-[0.22em] uppercase">
                  {currentYear === firstPostYear ? `Vol. ${currentYear}` : `${firstPostYear} → ${currentYear}`}
                </span>
              </div>
              <h1 className="font-display text-[36px] sm:text-[52px] lg:text-[68px] xl:text-[80px] leading-[0.92] tracking-tight">
                <span className="block">STORIES</span>
                <span className="block text-sienna-500">IN MOTION.</span>
              </h1>
              <p className="mt-6 max-w-lg text-cream-100/80 text-sm lg:text-base leading-relaxed">
                Training notes, design diaries, styling inspiration and conversations
                from the FITAURA studio in Calgary.
              </p>
            </div>

            <aside className="lg:col-span-4 lg:pl-10 lg:border-l lg:border-cream-100/15">
              <dl className="grid grid-cols-3 gap-y-5 gap-x-4 text-cream-100/80">
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Stories</dt>
                  <dd className="font-display text-2xl text-cream-50">
                    {String(posts.length).padStart(2, '0')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Topics</dt>
                  <dd className="font-display text-2xl text-cream-50">
                    {String(allTags.length).padStart(2, '0')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.28em] uppercase text-cream-100/60 mb-1">Issue</dt>
                  <dd className="font-display text-2xl text-cream-50">
                    {String(currentYear).slice(-2)}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        /* ── Empty state ── */
        <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
          <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-cream-200 text-ink-500 mb-6">
            <i className="ri-article-line text-2xl" aria-hidden></i>
          </span>
          <h2 className="font-display text-3xl mb-3">No journal entries yet</h2>
          <p className="text-ink-500 max-w-md mx-auto">
            We&rsquo;re working on stories from the studio. Check back soon — or
            follow along on Instagram.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-7 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
          >
            Shop The Edit
          </Link>
        </section>
      ) : (
        <>

          {/* ─────────────────────────────────────────────────────────
              2 · TOPIC RAIL
              Horizontal scrolling chip nav — uses real tag data when
              available, links to /blog/tag/<slug> (graceful fallback).
              ─────────────────────────────────────────────────────── */}
          {allTags.length > 0 && (
            <section className="bg-cream-50 border-b border-cream-200">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="text-[10px] tracking-[0.28em] uppercase text-ink-500 flex-shrink-0 mr-3">
                    Read by topic /
                  </span>
                  <span className="inline-flex items-center bg-ink-900 text-cream-50 px-4 py-2 text-[10px] tracking-[0.24em] uppercase font-semibold flex-shrink-0">
                    All Stories
                  </span>
                  {allTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-cream-100 hover:bg-cream-200 border border-cream-200 text-ink-700 px-4 py-2 text-[10px] tracking-[0.24em] uppercase font-semibold flex-shrink-0 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────
              3 · COVER STORY
              Full-bleed dark editorial frame for the most recent post.
              Treats the post as a magazine cover, not a card.
              ─────────────────────────────────────────────────────── */}
          {featured && (
            <section className="bg-ink-900 text-cream-50">
              <Link
                href={`/blog/${featured.slug}`}
                className="group block relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
                  {/* Image */}
                  <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[640px] bg-ink-700 overflow-hidden">
                    {featured.featured_image && (
                      <Image
                        src={featured.featured_image}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        priority
                        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/60 via-transparent to-transparent" />
                    <span className="absolute top-5 left-5 bg-sienna-500 text-cream-50 px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.24em] uppercase">
                      Cover Story · No. 01
                    </span>
                  </div>

                  {/* Text */}
                  <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-cream-100/70 mb-6">
                      {featured.tags?.[0] && (
                        <span className="text-sienna-500 font-semibold">{featured.tags[0]}</span>
                      )}
                      <span>{formatDate(featured.published_at ?? featured.created_at)}</span>
                      <span>{readTime(featured.excerpt)}</span>
                    </div>
                    <h2 className="font-display text-[36px] sm:text-[48px] lg:text-[60px] leading-[0.95] tracking-tight group-hover:text-sienna-500 transition-colors duration-300">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-6 text-cream-100/80 leading-relaxed text-base lg:text-[17px] max-w-md">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="mt-9 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] uppercase text-cream-50 group-hover:text-sienna-500 transition-colors">
                      Read The Cover
                      <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1" aria-hidden></i>
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────
              4 · THE EDIT
              The next three posts get the "above the fold" treatment —
              same scale, equal weight, magazine three-up.
              ─────────────────────────────────────────────────────── */}
          {aboveFold.length > 0 && (
            <section className="bg-cream-50">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
                <div className="flex items-end justify-between flex-wrap gap-6 mb-12 lg:mb-16">
                  <div>
                    <span className="eyebrow mb-3 block">This week</span>
                    <h3 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] leading-[0.95] tracking-tight">
                      THE EDIT.
                    </h3>
                  </div>
                  <Link
                    href="/shop?sort=newest"
                    className="inline-flex items-center gap-2 text-ink-900 text-[11px] font-semibold tracking-[0.24em] uppercase hover:text-sienna-500 transition-colors"
                  >
                    Shop Latest Drop <i className="ri-arrow-right-line" aria-hidden></i>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                  {aboveFold.map((post, idx) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/5] bg-cream-100 overflow-hidden mb-6">
                        {post.featured_image && (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                          />
                        )}
                        <span className="absolute top-4 left-4 bg-cream-50/95 text-ink-900 px-3 py-1.5 text-[10px] tracking-[0.24em] uppercase font-semibold">
                          {String(idx + 2).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
                        {post.tags?.[0] && (
                          <span className="text-sienna-500 font-semibold">{post.tags[0]}</span>
                        )}
                        <span>{formatDate(post.published_at ?? post.created_at)}</span>
                        <span>{readTime(post.excerpt)}</span>
                      </div>
                      <h4 className="font-display text-[24px] sm:text-[28px] lg:text-[30px] leading-[1.05] tracking-tight mb-3 group-hover:text-sienna-500 transition-colors duration-300">
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-ink-500 text-[15px] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────
              5 · THE ARCHIVE
              Everything else — denser editorial list. Image + title +
              tag/date in a horizontal layout. Reads like a contents
              page in the back of a magazine.
              ─────────────────────────────────────────────────────── */}
          {archive.length > 0 && (
            <section className="bg-cream-100 border-t border-cream-200">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
                <div className="flex items-end justify-between flex-wrap gap-6 mb-12 lg:mb-14">
                  <div>
                    <span className="eyebrow mb-3 block">Read again</span>
                    <h3 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] leading-[0.95] tracking-tight">
                      THE ARCHIVE.
                    </h3>
                  </div>
                  <span className="text-[11px] tracking-[0.22em] uppercase text-ink-500">
                    {String(archive.length).padStart(2, '0')} more stories
                  </span>
                </div>

                <ul className="divide-y divide-cream-200">
                  {archive.map((post, idx) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group grid grid-cols-12 gap-4 lg:gap-8 items-center py-6 lg:py-7"
                      >
                        <span className="col-span-2 sm:col-span-1 font-display text-2xl lg:text-3xl text-ink-300 group-hover:text-sienna-500 transition-colors">
                          {String(idx + aboveFold.length + 2).padStart(2, '0')}
                        </span>

                        <div className="col-span-3 sm:col-span-2 relative aspect-square bg-cream-200 overflow-hidden">
                          {post.featured_image && (
                            <Image
                              src={post.featured_image}
                              alt={post.title}
                              fill
                              sizes="(max-width: 640px) 25vw, 12vw"
                              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                            />
                          )}
                        </div>

                        <div className="col-span-7 sm:col-span-7">
                          <div className="flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-2">
                            {post.tags?.[0] && (
                              <span className="text-sienna-500 font-semibold">{post.tags[0]}</span>
                            )}
                            <span>{formatDate(post.published_at ?? post.created_at)}</span>
                          </div>
                          <h4 className="font-display text-lg sm:text-2xl leading-snug tracking-tight group-hover:text-sienna-500 transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h4>
                        </div>

                        <div className="hidden sm:flex col-span-2 justify-end text-ink-700 group-hover:text-sienna-500 transition-colors">
                          <i className="ri-arrow-right-line text-2xl transition-transform duration-300 group-hover:translate-x-1" aria-hidden></i>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6 · NEWSLETTER / STUDIO LETTERS
          Branded ink-900 band — matches the homepage's dark CTA
          rhythm. Visual-only on the storefront for now; wiring up
          to a Resend list is a backend follow-up.
          ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 text-cream-50">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-[10px] tracking-[0.28em] uppercase text-sienna-500 font-semibold mb-3 block">
                Studio Letters
              </span>
              <h2 className="font-display text-[26px] sm:text-[34px] lg:text-[42px] leading-[0.95] tracking-tight">
                <span className="block">FROM THE STUDIO</span>
                <span className="block text-sienna-500">TO YOUR INBOX.</span>
              </h2>
              <p className="mt-4 text-cream-100/70 leading-relaxed text-[13px] lg:text-sm max-w-md">
                A short letter from FITAURA every other Sunday — new drops, studio
                notes, and the occasional playlist. No noise.
              </p>
            </div>

            <JournalNewsletter />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7 · SHOP CTA
          Final pivot back to commerce. Mirrors the About page closer.
          ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream-50">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24 text-center">
          <span className="eyebrow text-sienna-500 mb-5 block">Shop The Collection</span>
          <h2 className="font-display text-[40px] sm:text-[54px] lg:text-[64px] leading-[0.95] tracking-tight mb-8 text-ink-900">
            <span className="block">READ. WEAR.</span>
            <span className="block text-sienna-500">REPEAT.</span>
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-ink-900 hover:bg-sienna-500 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
          >
            Explore Products <i className="ri-arrow-right-line" aria-hidden></i>
          </Link>
        </div>
      </section>
    </main>
  );
}
