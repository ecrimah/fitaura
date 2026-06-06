import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'You Are Offline',
  description: 'You are currently offline. Reconnect to continue shopping FITAURA.',
  path: '/offline',
});

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
