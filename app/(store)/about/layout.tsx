import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'About FITAURA — Modern Lifestyle Clothing from Calgary' },
  description: 'FITAURA is a modern lifestyle clothing brand from Calgary, Canada — building gymwear, athleisure and fashion-forward apparel to empower confidence and comfort.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About FITAURA',
    description: 'A modern lifestyle clothing brand from Calgary, Canada.',
    url: `${SITE_URL}/about`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'About FITAURA' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'About FITAURA', description: 'Modern lifestyle clothing from Calgary, Canada.', images: [`${SITE_URL}/og-image.png`] },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
