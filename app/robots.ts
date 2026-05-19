import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for all bots: allow shopping content, block private + transactional surfaces
      {
        userAgent: '*',
        allow: ['/', '/shop', '/categories', '/category/', '/product/', '/blog', '/about', '/contact', '/sustainability', '/size-guide', '/care-guide', '/faqs', '/shipping', '/returns', '/privacy', '/terms'],
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
          '/*?source=pwa*',
          '/*?source=pwa-shortcut*',
        ],
      },
      // Friendly explicit allow for Googlebot-Image to index product photography
      {
        userAgent: 'Googlebot-Image',
        allow: ['/brand/', '/og-image.png', '/og-image-square.png', '/icon-512.png', '/apple-touch-icon.png'],
        disallow: ['/admin/', '/api/'],
      },
      // Block aggressive SEO/scraping bots
      {
        userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'PetalBot'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
