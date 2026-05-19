import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Size Guide — Find Your Perfect Fit | FITAURA' },
  description: 'FITAURA size guide — measurements for tops, bottoms, sports bras and lounge pieces, with fit notes from real bodies. Find your perfect fit.',
  alternates: { canonical: `${SITE_URL}/size-guide` },
  openGraph: {
    title: 'FITAURA Size Guide',
    description: 'Measurements for tops, bottoms, sports bras and lounge pieces.',
    url: `${SITE_URL}/size-guide`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Size Guide' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
