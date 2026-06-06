import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TAGLINE_SHORT,
  SITE_URL,
  TWITTER_HANDLE,
  DEFAULT_OG_IMAGE as OG_IMAGE,
  DEFAULT_OG_IMAGE_SQUARE as OG_IMAGE_SQUARE,
  getFocusKeywords,
} from "@/lib/seo";
import {
  generateOrganizationEeatSchema,
  generateWebsiteSchema,
  generateOnlineStoreSchema,
  generateClothingStoreSchema,
  generateBrandSchema,
  MERCHANT_RETURN_POLICY,
} from "@/lib/seo-schemas";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#26261F' },
  ],
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE_SHORT}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  generator: 'Next.js',
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  keywords: getFocusKeywords('all'),
  category: 'shopping',
  classification: 'Ecommerce, Apparel, Activewear',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Next.js auto-injects <link rel="icon" href="/favicon.ico"> from
  // app/favicon.ico, so don't list it here (avoids duplicate tags).
  // The `?v=N` query bumps the browser's persistent favicon cache without
  // changing the file path. Increment when /public/favicon-*.png changes.
  icons: {
    icon: [
      { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png?v=5', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=5', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-167.png?v=5', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon-152.png?v=5', sizes: '152x152', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon-512.png', color: '#D14F2B' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
    startupImage: ['/apple-touch-icon.png'],
  },
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    alternateLocale: ['en_US', 'en_GB'],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE_SHORT}`,
    description: SITE_TAGLINE,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — modern lifestyle clothing built to empower confidence and comfort.`,
        type: 'image/png',
      },
      {
        url: OG_IMAGE_SQUARE,
        width: 1200,
        height: 1200,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — ${SITE_TAGLINE_SHORT}`,
    description: SITE_TAGLINE,
    images: [OG_IMAGE],
  },
  // No `alternates.canonical` here — each page/layout sets its own canonical
  // via `buildPageMetadata({ path })` so we don't leak the homepage canonical
  // onto inner routes that forget to override it. The home page sets
  // `canonical: SITE_URL` in `app/(store)/page.tsx`.
  alternates: {
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}/blog/rss.xml`, title: `${SITE_NAME} Journal` },
      ],
    },
  },
  // `other` is reserved for tags Next.js doesn't already render from the
  // canonical metadata fields above. Don't duplicate format-detection,
  // apple-mobile-web-app-*, or theme-color here — they're emitted from
  // formatDetection / appleWebApp / viewport respectively.
  other: {
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#26261F',
    'msapplication-TileImage': '/mstile-150.png',
    'mobile-web-app-capable': 'yes',
    'pinterest-rich-pin': 'true',
  },
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const organizationJsonLd = generateOrganizationEeatSchema();
const websiteJsonLd = generateWebsiteSchema();
const storeJsonLd = generateOnlineStoreSchema();
const clothingStoreJsonLd = generateClothingStoreSchema();
const brandJsonLd = generateBrandSchema();
const returnPolicyJsonLd = { '@context': 'https://schema.org', ...MERCHANT_RETURN_POLICY };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <head>
        {/* theme-color is emitted by the `viewport` export above; do not duplicate here. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucbokethripnihazffcg.supabase.co'} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: fonts loaded in root layout apply to all pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* Dev-only safety: on localhost, immediately unregister any leftover
            service worker and clear all caches. This runs synchronously before
            React hydration so stale SW-cached HTML can't cause mismatches. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'||h==='0.0.0.0'){if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}if(typeof caches!=='undefined'){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});});}if(!sessionStorage.getItem('__fitaura_dev_sw_cleared__')){sessionStorage.setItem('__fitaura_dev_sw_cleared__','1');setTimeout(function(){location.reload();},150);}}}catch(e){}})();`,
          }}
        />

        {/* Site-wide JSON-LD: Organization, WebSite (with sitelinks search),
            OnlineStore, ClothingStore (local SEO). Rendered as raw <script>
            tags inside <head> so they're discoverable on first byte. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clothingStoreJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(returnPolicyJsonLd) }}
        />
      </head>

      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      <body className="antialiased font-sans bg-cream-50 text-ink-700 overflow-x-hidden pwa-body">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-sienna-500 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <div id="main-content">
              {children}
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
