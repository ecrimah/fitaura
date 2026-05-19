import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | FITAURA' },
  description: 'The terms that govern your use of shopfitaura.com — orders, payments, intellectual property, warranties and limitations of liability.',
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
