import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Your Bag',
  description: 'Review the items in your FITAURA bag before checkout.',
  path: '/cart',
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
