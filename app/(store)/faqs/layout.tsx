import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'FAQs — Sizing, Shipping & Returns | FITAURA' },
  description: 'Answers to the most common questions about FITAURA — sizing, fit, shipping times, returns, exchanges, materials and care.',
  alternates: { canonical: `${SITE_URL}/faqs` },
  openGraph: {
    title: 'FITAURA FAQs',
    description: 'Sizing, shipping, returns, exchanges, materials and care — answered.',
    url: `${SITE_URL}/faqs`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA FAQs' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'FITAURA FAQs', description: 'Common questions, answered.', images: [`${SITE_URL}/og-image.png`] },
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
