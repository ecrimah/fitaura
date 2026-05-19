import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Journal — Style, Movement & Story | FITAURA' },
  description: 'The FITAURA Journal — editorials on style, movement, training, sustainability and the women building confidence in motion.',
  alternates: { canonical: `${SITE_URL}/blog`, types: { 'application/rss+xml': `${SITE_URL}/blog/rss.xml` } },
  openGraph: {
    title: 'FITAURA Journal',
    description: 'Editorials on style, movement, training and the women building confidence in motion.',
    url: `${SITE_URL}/blog`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Journal' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'FITAURA Journal', description: 'Style, movement & story from FITAURA.', images: [`${SITE_URL}/og-image.png`] },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
