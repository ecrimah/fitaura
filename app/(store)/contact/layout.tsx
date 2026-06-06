import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact FITAURA — Gymwear & Athleisure Support',
  description:
    'Contact FITAURA for gymwear and athleisure sizing help, order support, wholesale and press. Calgary, Canada — Fitaurawear@gmail.com. We reply within one business day.',
  path: '/contact',
  keywordCluster: 'expertise',
  absoluteTitle: true,
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
