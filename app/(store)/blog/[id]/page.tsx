import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  StructuredData,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from '@/components/SEOHead';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const revalidate = 60;

// The dynamic segment is named `[id]` for legacy reasons but always
// receives the post slug. Keep it that way to avoid breaking any
// external links already in the wild.
type Params = { id: string };

interface BlogPostFull {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, content, featured_image, tags, published_at, created_at, seo_title, seo_description')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogPostFull;
  } catch {
    return null;
  }
}

async function getRelated(slug: string, tags: string[] | null) {
  if (!isSupabaseConfigured) return [];
  try {
    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, featured_image, published_at, created_at, tags')
      .eq('status', 'published')
      .neq('slug', slug)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(3);
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }
    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostBySlug(id);
  if (!post) {
    return {
      title: 'Article not found',
      description: 'The article you are looking for is no longer available.',
      robots: { index: false, follow: true },
    };
  }
  const url = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.featured_image || `${SITE_URL}/og-image.png`;
  const description = (post.seo_description || post.excerpt || `Read "${post.title}" on the FITAURA Journal.`).slice(0, 160);
  const publishedTime = post.published_at || post.created_at;

  return {
    title: post.seo_title || post.title,
    description,
    keywords: post.tags ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      siteName: 'FITAURA',
      locale: 'en_CA',
      publishedTime,
      modifiedTime: post.created_at,
      tags: post.tags ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
      site: '@fitaura_ca',
      creator: '@fitaura_ca',
    },
  };
}

function formatDate(value: string | null, long = false): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: long ? 'long' : 'short',
    day: 'numeric',
  });
}

function readTime(content: string): string {
  const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const post = await getPostBySlug(id);

  if (!post) {
    notFound();
  }

  const related = await getRelated(post.slug, post.tags);
  const sanitizedContent = sanitizeHtml(post.content);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const issueDate = post.published_at ?? post.created_at;

  const blogPostingSchema = generateBlogPostingSchema({
    title: post.title,
    description: post.excerpt || post.title,
    url: postUrl,
    image: post.featured_image || `${SITE_URL}/og-image.png`,
    publishedTime: issueDate,
    modifiedTime: post.created_at,
    tags: post.tags ?? undefined,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Journal', url: `${SITE_URL}/blog` },
    { name: post.title, url: postUrl },
  ]);

  const shareLinks = [
    {
      label: 'X',
      icon: 'ri-twitter-x-line',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`,
    },
    {
      label: 'Facebook',
      icon: 'ri-facebook-fill',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
    {
      label: 'Pinterest',
      icon: 'ri-pinterest-line',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&description=${encodeURIComponent(post.title)}${post.featured_image ? `&media=${encodeURIComponent(post.featured_image)}` : ''}`,
    },
    {
      label: 'Email',
      icon: 'ri-mail-line',
      href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Thought you'd enjoy this from FITAURA: ${postUrl}`)}`,
    },
  ];

  return (
    <article className="bg-cream-50 text-ink-900">
      <StructuredData data={blogPostingSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* ─────────────────────────────────────────────────────────────
          1 · CINEMATIC HERO
          Full-bleed image with cream eyebrow + display headline laid
          over a soft ink gradient. Matches the homepage hero cadence.
          ─────────────────────────────────────────────────────────── */}
      <header className="relative bg-ink-900 text-cream-50 overflow-hidden">
        <div className="relative h-[68vh] min-h-[520px] max-h-[820px]">
          {post.featured_image && (
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/55 to-ink-900/20" />

          {/* Breadcrumb sits at the top edge */}
          <nav
            aria-label="Breadcrumb"
            className="absolute inset-x-0 top-0 z-10"
          >
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8">
              <ol className="flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-cream-100/70">
                <li>
                  <Link href="/" className="hover:text-cream-50 transition-colors">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/blog" className="hover:text-cream-50 transition-colors">Journal</Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-sienna-500 truncate max-w-[40vw]">{post.tags?.[0] ?? 'Story'}</li>
              </ol>
            </div>
          </nav>

          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 pb-14 lg:pb-20">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-cream-100/80 mb-5">
                <span className="text-sienna-500 font-semibold">
                  {post.tags?.[0] ?? 'Story'}
                </span>
                <span className="h-px w-8 bg-cream-100/40" />
                <span>{formatDate(issueDate, true)}</span>
                <span aria-hidden>·</span>
                <span>{readTime(post.content)}</span>
              </div>
              <h1 className="font-display text-[40px] sm:text-[60px] lg:text-[80px] xl:text-[92px] leading-[0.92] tracking-tight max-w-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-7 max-w-2xl text-cream-100/85 leading-relaxed text-base lg:text-[19px] font-light">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2 · BYLINE STRIP
          Slim band between the hero and the body. Issue + share.
          ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-cream-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.24em] uppercase text-ink-500">
            <span className="font-semibold text-ink-900">FITAURA Studio</span>
            <span className="h-px w-6 bg-ink-200" />
            <span>Issue {new Date(issueDate).getFullYear()}</span>
          </div>
          <ul className="flex items-center gap-2">
            <li className="text-[10px] tracking-[0.24em] uppercase text-ink-500 mr-2">Share /</li>
            {shareLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${link.label}`}
                  className="w-9 h-9 inline-flex items-center justify-center border border-ink-200 text-ink-700 hover:bg-ink-900 hover:text-cream-50 hover:border-ink-900 transition-colors"
                >
                  <i className={`${link.icon} text-sm`} aria-hidden></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3 · ARTICLE BODY
          The dropcap selector targets the first paragraph inside the
          rendered prose. Custom styling pushed into globals.css would
          be cleaner, but inline `style` keeps the article page self-
          contained.
          ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div
          className="blog-content blog-content--editorial text-ink-700 leading-relaxed text-[17px] lg:text-[18px]"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Tag row */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-cream-200">
            <span className="eyebrow mb-4 block">Filed under</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1.5 bg-cream-100 border border-cream-200 text-[11px] tracking-[0.18em] uppercase text-ink-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom share + back link */}
        <div className="mt-12 pt-8 border-t border-cream-200 flex items-center justify-between flex-wrap gap-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-ink-900 text-[11px] font-semibold tracking-[0.24em] uppercase hover:text-sienna-500 transition-colors"
          >
            <i className="ri-arrow-left-line" aria-hidden></i>
            All Stories
          </Link>
          <ul className="flex items-center gap-2">
            {shareLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${link.label}`}
                  className="w-9 h-9 inline-flex items-center justify-center border border-ink-200 text-ink-700 hover:bg-ink-900 hover:text-cream-50 hover:border-ink-900 transition-colors"
                >
                  <i className={`${link.icon} text-sm`} aria-hidden></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4 · KEEP READING
          Editorial three-up. Reuses the journal index card pattern
          for consistency.
          ─────────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-cream-100 border-t border-cream-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24">
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div>
                <span className="eyebrow mb-3 block">Keep reading</span>
                <h2 className="font-display text-[32px] sm:text-[44px] lg:text-[52px] leading-[0.95] tracking-tight">
                  MORE FROM THE STUDIO.
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-ink-900 text-[11px] font-semibold tracking-[0.24em] uppercase hover:text-sienna-500 transition-colors"
              >
                The Archive <i className="ri-arrow-right-line" aria-hidden></i>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {related.map((rp, idx) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block">
                  <div className="relative aspect-[4/5] bg-cream-200 overflow-hidden mb-5">
                    {rp.featured_image && (
                      <Image
                        src={rp.featured_image}
                        alt={rp.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      />
                    )}
                    <span className="absolute top-4 left-4 bg-cream-50/95 text-ink-900 px-3 py-1.5 text-[10px] tracking-[0.24em] uppercase font-semibold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
                    {rp.tags?.[0] && (
                      <span className="text-sienna-500 font-semibold">{rp.tags[0]}</span>
                    )}
                    <span>{formatDate(rp.published_at ?? rp.created_at)}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl leading-snug tracking-tight mb-3 group-hover:text-sienna-500 transition-colors duration-300">
                    {rp.title}
                  </h3>
                  {rp.excerpt && (
                    <p className="text-ink-500 text-sm leading-relaxed line-clamp-2">{rp.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5 · SHOP CTA
          Closing pivot back to commerce.
          ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 text-cream-50">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24 text-center">
          <span className="eyebrow text-sienna-500 mb-5 block">Shop The Collection</span>
          <h2 className="font-display text-[40px] sm:text-[54px] lg:text-[64px] leading-[0.95] tracking-tight mb-8">
            <span className="block">CONFIDENCE</span>
            <span className="block text-sienna-500">IN MOTION.</span>
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-sienna-500 hover:bg-sienna-600 text-cream-50 px-9 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
          >
            Shop Now <i className="ri-arrow-right-line" aria-hidden></i>
          </Link>
        </div>
      </section>
    </article>
  );
}
