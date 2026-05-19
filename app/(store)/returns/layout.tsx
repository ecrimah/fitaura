import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Returns & Exchanges — 30 Days Free in Canada | FITAURA' },
  description: 'Easy 30-day returns on unworn items, free across Canada. Quick exchanges by size or color — wear it, work out in it, and if it is not for you, send it back.',
  alternates: { canonical: `${SITE_URL}/returns` },
  openGraph: {
    title: 'Returns & Exchanges | FITAURA',
    description: '30-day free returns across Canada. Quick exchanges on size or color.',
    url: `${SITE_URL}/returns`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Returns' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'Returns & Exchanges | FITAURA', description: '30-day free returns in Canada.', images: [`${SITE_URL}/og-image.png`] },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
