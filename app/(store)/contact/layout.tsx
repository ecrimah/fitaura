import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Contact FITAURA — We Reply Within One Business Day' },
  description: 'Get in touch with the FITAURA team — sizing help, order questions, wholesale, press. Calgary, Canada. We reply within one business day.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact FITAURA',
    description: 'Sizing help, order questions, wholesale, press — we reply within one business day.',
    url: `${SITE_URL}/contact`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Contact FITAURA' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'Contact FITAURA', description: 'Reach the FITAURA team.', images: [`${SITE_URL}/og-image.png`] },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
