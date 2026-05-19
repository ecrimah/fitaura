import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Sign in | FITAURA' },
  description: 'Sign in to your FITAURA account to track orders, manage your wishlist and check out faster.',
  alternates: { canonical: `${SITE_URL}/auth/login` },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
