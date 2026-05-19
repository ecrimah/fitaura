import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | FITAURA' },
  description: 'How FITAURA collects, uses and protects your personal information. PIPEDA-aligned privacy policy for shoppers in Canada and beyond.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
