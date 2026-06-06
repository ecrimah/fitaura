import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Order Confirmed',
  description: 'Your FITAURA order has been confirmed.',
  path: '/order-success',
});

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
