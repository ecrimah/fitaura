import type { Metadata } from 'next';
import { getFocusKeywords } from './seo-keywords';

export { FOCUS_META_DESCRIPTION, FOCUS_PRODUCT_PHRASE, getFocusKeywords, buildFocusDescription } from './seo-keywords';

/**
 * Centralized SEO constants + Metadata builders.
 *
 * Every page/layout under `app/**` should call `buildPageMetadata()` (or
 * `noindexMetadata()` for private/transactional routes) instead of hand-rolling
 * a `Metadata` object. This keeps:
 *  - title casing + template behavior
 *  - canonical URLs
 *  - Open Graph + Twitter cards
 *  - robots directives
 * consistent across the entire storefront, and prevents drift when the brand,
 * domain, or social handles change.
 */

// ---------------------------------------------------------------------------
// Site constants
// ---------------------------------------------------------------------------

export const SITE_NAME = 'FITAURA';
export const SITE_TAGLINE_SHORT = 'Confidence In Motion.';
export const SITE_TAGLINE =
  'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort. Designed in Calgary, shipping worldwide.';
export const SITE_LOCALE = 'en_CA';
export const SITE_LANGUAGE = 'en-CA';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com'
).replace(/\/+$/, '');

export const TWITTER_HANDLE = '@fitaura_ca';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_OG_IMAGE_SQUARE = `${SITE_URL}/og-image-square.png`;

/** Default keyword set merged into every indexable page. */
const DEFAULT_KEYWORDS = getFocusKeywords('all');

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/** Always returns an absolute URL on the configured production domain. */
export function absoluteUrl(path?: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${trimmed}`;
}

/** Strip query strings + trailing slashes for canonical URLs. */
export function canonicalUrl(path?: string): string {
  const url = absoluteUrl(path).split('#')[0].split('?')[0];
  return url.endsWith('/') && url !== SITE_URL ? url.slice(0, -1) : url;
}

// ---------------------------------------------------------------------------
// buildPageMetadata
// ---------------------------------------------------------------------------

export interface BuildPageMetadataOptions {
  /** Page title without the brand suffix. Will be templated as `%s | FITAURA`. */
  title: string;
  /** ~155-char meta description. */
  description: string;
  /** Absolute path of the page (e.g. `/shop`). Used for canonical + og:url. */
  path: string;
  /**
   * Optional extra keywords merged with the brand defaults.
   * Pass `keywordCluster` to auto-merge a focus cluster (commerce, expertise…).
   */
  keywords?: string[];
  keywordCluster?: import('./seo-keywords').KeywordCluster | import('./seo-keywords').KeywordCluster[];
  /**
   * OG image — accepts an absolute URL or a `/path`. Defaults to the
   * site-wide `og-image.png`.
   */
  ogImage?: string;
  /** Alt text for the OG image. */
  ogImageAlt?: string;
  /** OG type. Defaults to `website`. */
  ogType?: 'website' | 'article' | 'profile';
  /** When `ogType === 'article'` — ISO timestamp for published date. */
  publishedTime?: string;
  /** When `ogType === 'article'` — ISO timestamp for last update. */
  modifiedTime?: string;
  /** Optional author for article OG. */
  author?: string;
  /** When `true`, robots/Google receive `noindex,nofollow`. */
  noindex?: boolean;
  /**
   * Bypass the `%s | FITAURA` template — use the title as-is. Useful when the
   * page title already includes the brand (e.g. the home page).
   */
  absoluteTitle?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  keywordCluster,
  ogImage,
  ogImageAlt,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  noindex = false,
  absoluteTitle = false,
}: BuildPageMetadataOptions): Metadata {
  const canonical = canonicalUrl(path);
  const resolvedOg = ogImage ? absoluteUrl(ogImage) : DEFAULT_OG_IMAGE;
  const clusterKeywords = keywordCluster
    ? getFocusKeywords(...(Array.isArray(keywordCluster) ? keywordCluster : [keywordCluster]))
    : [];
  const mergedKeywords = Array.from(
    new Set([...(keywords ?? []), ...clusterKeywords, ...DEFAULT_KEYWORDS]),
  );

  const meta: Metadata = {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
      languages: {
        [SITE_LANGUAGE]: canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      type: ogType,
      locale: SITE_LOCALE,
      alternateLocale: ['en_US', 'en_GB'],
      url: canonical,
      siteName: SITE_NAME,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: resolvedOg,
          width: 1200,
          height: 630,
          alt: ogImageAlt || title,
          type: 'image/png',
        },
      ],
      ...(ogType === 'article'
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            authors: author ? [author] : undefined,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [resolvedOg],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            'max-snippet': -1,
            'max-image-preview': 'none',
            'max-video-preview': -1,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
    authors: author ? [{ name: author }] : undefined,
  };

  return meta;
}

// ---------------------------------------------------------------------------
// noindexMetadata
// ---------------------------------------------------------------------------

/**
 * Convenience builder for private/transactional routes (cart, checkout,
 * account, help, etc.). Still sets a sensible title + canonical so the page
 * renders cleanly in the browser tab and isn't blank for crawlers that ignore
 * `noindex`.
 */
export function noindexMetadata(opts: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  return buildPageMetadata({
    title: opts.title,
    description:
      opts.description ??
      'This is a private page on FITAURA and is not indexed by search engines.',
    path: opts.path,
    noindex: true,
  });
}
