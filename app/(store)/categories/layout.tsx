import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Shop by Category — Lounge, Lifestyle, New & Accessories | FITAURA' },
  description: 'Browse FITAURA by category — Lounge & Lifestyle, New Arrivals, Accessories and signature Collections built for confidence and comfort.',
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: 'Shop by Category | FITAURA',
    description: 'Lounge, Lifestyle, New Arrivals, Accessories and signature Collections.',
    url: `${SITE_URL}/categories`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Categories' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'Shop by Category | FITAURA', description: 'Lounge, Lifestyle, New Arrivals, Accessories and Collections.', images: [`${SITE_URL}/og-image.png`] },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
