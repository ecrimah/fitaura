import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/seo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Static, indexable storefront routes. Order = publishing priority for Google.
 * Anything transactional/private (cart, checkout, account, auth, help, etc.)
 * MUST stay out of here — those routes are blocked in robots.ts and carry
 * `noindex` metadata at the page level too.
 */
const STATIC_PAGES: Array<Omit<SitemapEntry, 'lastModified'> & { lastModified?: Date }> = [
  { url: SITE_URL,                       changeFrequency: 'daily',   priority: 1.0 },
  { url: `${SITE_URL}/shop`,             changeFrequency: 'daily',   priority: 0.95 },
  { url: `${SITE_URL}/categories`,       changeFrequency: 'weekly',  priority: 0.85 },
  { url: `${SITE_URL}/about`,            changeFrequency: 'monthly', priority: 0.7 },
  { url: `${SITE_URL}/contact`,          changeFrequency: 'monthly', priority: 0.65 },
  { url: `${SITE_URL}/blog`,             changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${SITE_URL}/faqs`,             changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/shipping`,         changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/returns`,          changeFrequency: 'monthly', priority: 0.45 },
  { url: `${SITE_URL}/sustainability`,   changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/size-guide`,       changeFrequency: 'monthly', priority: 0.55 },
  { url: `${SITE_URL}/care-guide`,       changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/privacy`,          changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${SITE_URL}/terms`,            changeFrequency: 'yearly',  priority: 0.3 },
];

export const revalidate = 3600; // regenerate at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Build a stable "now" for all static entries so Google sees one consistent
  // build timestamp per regeneration window.
  const now = new Date();
  const entries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
    ...page,
    lastModified: page.lastModified ?? now,
  }));

  // Skip the Supabase round-trip during builds where the env isn't configured
  // (placeholders, preview deploys, local sandbox).
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_PROJECT_REF')) {
    return entries;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // -------- Products --------
    // Only `active` products go into the sitemap. We use Supabase's
    // `updated_at` as `lastmod` so search engines re-crawl when stock,
    // pricing, or photography changes.
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1000);

    for (const p of products ?? []) {
      if (!p.slug) continue;
      entries.push({
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // -------- Category filter pages --------
    // The storefront category routes live at `/shop?category={slug}`. These
    // are the URLs we serve internally + link from the global nav, so we
    // publish exactly that shape (matches the canonical URL on the page).
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('position', { ascending: true });

    for (const c of categories ?? []) {
      if (!c.slug) continue;
      entries.push({
        url: `${SITE_URL}/shop?category=${encodeURIComponent(c.slug)}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }

    // -------- Blog posts --------
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000);

    for (const post of posts ?? []) {
      if (!post.slug) continue;
      const lastmod = post.updated_at || post.published_at;
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: lastmod ? new Date(lastmod) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error('[sitemap] Error fetching dynamic entries:', error);
  }

  return entries;
}
