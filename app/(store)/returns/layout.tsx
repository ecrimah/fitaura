import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Returns & Exchanges — 30 Days Free | FITAURA',
  description:
    '30-day free returns on FITAURA gymwear and athleisure across Canada. Easy exchanges on size or colour — shop modern lifestyle clothing with confidence.',
  path: '/returns',
  keywordCluster: 'commerce',
  absoluteTitle: true,
});

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
