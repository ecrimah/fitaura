import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Sustainability — Slow Fashion Made Well | FITAURA' },
  description: 'How FITAURA designs for longevity — better materials, smaller runs, repairable construction, and a take-back program. Slow fashion made well in Calgary.',
  alternates: { canonical: `${SITE_URL}/sustainability` },
  openGraph: {
    title: 'FITAURA Sustainability',
    description: 'Better materials, smaller runs, repairable construction, take-back program.',
    url: `${SITE_URL}/sustainability`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Sustainability' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
};

export default function SustainabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
