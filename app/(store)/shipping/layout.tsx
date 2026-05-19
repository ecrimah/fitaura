import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Shipping & Delivery — Free in Canada $100+ | FITAURA' },
  description: 'Free standard shipping across Canada on orders $100+. Expedited and international shipping available. Calgary-based, shipping worldwide.',
  alternates: { canonical: `${SITE_URL}/shipping` },
  openGraph: {
    title: 'Shipping & Delivery | FITAURA',
    description: 'Free standard shipping across Canada on orders $100+. Worldwide delivery available.',
    url: `${SITE_URL}/shipping`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'FITAURA Shipping' }],
    type: 'website',
    siteName: 'FITAURA',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'Shipping & Delivery | FITAURA', description: 'Free standard shipping in Canada $100+.', images: [`${SITE_URL}/og-image.png`] },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
