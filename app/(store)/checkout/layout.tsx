import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Checkout',
  description: 'Secure checkout for your FITAURA order.',
  path: '/checkout',
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
