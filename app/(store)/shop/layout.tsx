import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Shop All — Activewear, Athleisure & Lifestyle | FITAURA' },
  description: 'Shop the full FITAURA collection — sculpting leggings, seamless sports bras, joggers and lifestyle pieces designed in Calgary. Free returns across Canada.',
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: 'Shop All | FITAURA',
    description: 'Sculpting leggings, seamless sports bras, joggers and lifestyle pieces designed in Calgary.',
    url: `${SITE_URL}/shop`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Shop' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'Shop All | FITAURA', description: 'The full FITAURA collection.', images: [`${SITE_URL}/og-image.png`] },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
