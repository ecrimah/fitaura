import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Care Guide — How to Keep Your FITAURA' },
  description: 'Wash cold, hang dry, no fabric softener. The full FITAURA care guide so your pieces stay sculpting, soft and high-performance for years.',
  alternates: { canonical: `${SITE_URL}/care-guide` },
  openGraph: {
    title: 'FITAURA Care Guide',
    description: 'Keep your pieces sculpting, soft and high-performance for years.',
    url: `${SITE_URL}/care-guide`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Care Guide' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
};

export default function CareGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
