import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Order Tracking',
  description: 'Track the status and delivery of your FITAURA order.',
  path: '/order-tracking',
});

export default function OrderTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
