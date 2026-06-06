import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shipping & Delivery — Gymwear Across Canada | FITAURA',
  description:
    'FITAURA ships gymwear and athleisure across Canada. Free standard shipping on orders $120+. Calgary-based modern lifestyle clothing, delivered fast.',
  path: '/shipping',
  keywordCluster: 'commerce',
  absoluteTitle: true,
});

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
