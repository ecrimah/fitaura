import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Robots.txt for FITAURA.
 *
 * Strategy:
 *  - Allow crawling of every public storefront route (home, shop, product,
 *    categories, blog, marketing, policies).
 *  - Disallow every private/transactional surface (admin, API, auth, account,
 *    cart, checkout, wishlist, payment, help, support, order receipts, PWA
 *    install pages).
 *  - Explicitly allow Googlebot-Image to crawl brand + OG assets so product
 *    photography ranks in Google Images.
 *  - Block aggressive SEO scrapers that hammer the site without value.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/categories',
          '/product/',
          '/blog',
          '/about',
          '/contact',
          '/sustainability',
          '/size-guide',
          '/care-guide',
          '/faqs',
          '/shipping',
          '/returns',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/auth/',
          '/account',
          '/account/',
          '/cart',
          '/checkout',
          '/wishlist',
          '/order-success',
          '/order-tracking',
          '/pay/',
          '/maintenance',
          '/offline',
          '/pwa-settings',
          '/help',
          '/help/',
          '/support/',
          '/returns/confirmation',
          // Strip out any tracking/source query params that PWA shortcuts use
          // so we don't get duplicate URLs in the index.
          '/*?source=pwa*',
          '/*?source=pwa-shortcut*',
          '/*?utm_*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/brand/',
          '/og-image.png',
          '/og-image-square.png',
          '/icon-192.png',
          '/icon-512.png',
          '/apple-touch-icon.png',
          '/favicon-96x96.png',
        ],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'PetalBot', 'BLEXBot'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
