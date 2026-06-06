import type { Metadata } from 'next';
import { buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export {
  generateOrganizationEeatSchema as generateOrganizationSchema,
  generateWebsiteSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateBlogPostingEeatSchema as generateBlogPostingSchema,
  generateFAQSchema,
  generateCollectionPageSchema,
} from '@/lib/seo-schemas';

export { default as StructuredData } from '@/components/StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  url?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
}

/**
 * Legacy metadata builder — delegates to `lib/seo.buildPageMetadata()` so
 * every page gets the same E-E-A-T keyword clusters and OG/Twitter cards.
 */
export function generateMetadata({
  title,
  description = 'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort.',
  keywords = [],
  ogImage,
  ogType = 'website',
  url,
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
}: SEOProps): Metadata {
  const resolvedTitle = title
    ? (title.includes(SITE_NAME) ? title : title)
    : `${SITE_NAME} — Confidence In Motion.`;

  return buildPageMetadata({
    title: resolvedTitle,
    description,
    path: url ? new URL(url, SITE_URL).pathname : '/',
    keywords,
    ogImage,
    ogType: ogType === 'product' ? 'website' : ogType,
    publishedTime,
    modifiedTime,
    author,
    noindex,
    absoluteTitle: Boolean(title && title.includes(SITE_NAME)),
  });
}
