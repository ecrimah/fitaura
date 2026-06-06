import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Wishlist',
  description: 'Pieces you have saved to your FITAURA edit.',
  path: '/wishlist',
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
