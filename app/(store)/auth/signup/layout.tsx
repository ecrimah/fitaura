import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  title: { absolute: 'Create an account | FITAURA' },
  description: 'Join FITAURA — track orders, save favourites and get early access to new arrivals.',
  alternates: { canonical: `${SITE_URL}/auth/signup` },
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
