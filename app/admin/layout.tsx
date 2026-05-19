import type { Metadata, Viewport } from 'next';
import AdminShell from './AdminShell';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com';

export const metadata: Metadata = {
  // `default.absolute` bypasses the root template (`%s | FITAURA`) so admin
  // pages don't render "FITAURA Admin | FITAURA".
  title: {
    absolute: 'FITAURA Admin',
    template: '%s · FITAURA Admin',
  } as unknown as Metadata['title'],
  description: 'FITAURA admin dashboard — manage products, orders, customers, content and analytics.',
  applicationName: 'FITAURA Admin',
  // Admin must never be indexed by search engines.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    noimageindex: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      noimageindex: true,
      nosnippet: true,
    },
  },
  alternates: { canonical: `${SITE_URL}/admin` },
  openGraph: { type: 'website', siteName: 'FITAURA Admin', title: 'FITAURA Admin', description: 'Internal dashboard.' },
  twitter: { card: 'summary', title: 'FITAURA Admin' },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#26261F',
  colorScheme: 'light',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
