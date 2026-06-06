import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Complete Payment',
  description: 'Complete payment for your FITAURA order.',
  path: '/pay',
});

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
