import { createClient } from '@supabase/supabase-js';
import {
  SITE_NAME,
  SITE_URL,
  SITE_TAGLINE_SHORT,
  absoluteUrl,
} from '@/lib/seo';

export const revalidate = 3600;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface BlogPost {
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  updated_at: string | null;
  tags: string[] | null;
}

/** Escape any character XML cares about so we don't blow up the feed parser. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function postToRssItem(post: BlogPost): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = escapeXml(post.title ?? 'Untitled');
  const description = escapeXml(post.excerpt ?? '');
  const pubDate = new Date(post.published_at ?? post.updated_at ?? Date.now()).toUTCString();
  const image = post.featured_image ? absoluteUrl(post.featured_image) : '';
  const categories = (post.tags ?? [])
    .filter((t): t is string => Boolean(t))
    .map((t) => `<category>${escapeXml(t)}</category>`)
    .join('');

  return [
    '    <item>',
    `      <title>${title}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <pubDate>${pubDate}</pubDate>`,
    `      <description>${description}</description>`,
    image
      ? `      <enclosure url="${escapeXml(image)}" type="image/jpeg" />`
      : '',
    categories,
    '    </item>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function GET() {
  let items = '';
  let lastBuildDate = new Date().toUTCString();

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_PROJECT_REF')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('blog_posts')
        .select('slug, title, excerpt, featured_image, published_at, updated_at, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      const posts = (data ?? []) as BlogPost[];
      items = posts.filter((p) => p.slug).map(postToRssItem).join('\n');
      const newest = posts[0];
      if (newest) {
        lastBuildDate = new Date(
          newest.published_at ?? newest.updated_at ?? Date.now(),
        ).toUTCString();
      }
    } catch (error) {
      console.error('[rss] Failed to load blog posts:', error);
    }
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)} Journal — ${escapeXml(SITE_TAGLINE_SHORT)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Style, movement, and story from the FITAURA team. Editorials, drops, and dispatches from our Calgary studio.</description>
    <language>en-CA</language>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE_NAME)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
