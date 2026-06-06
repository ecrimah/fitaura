import type { Metadata } from 'next';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Journal — Gymwear, Athleisure & Lifestyle Editorials | FITAURA',
  description:
    'The FITAURA Journal — expert editorials on gymwear, athleisure, modern lifestyle clothing, training, fit, sustainability and fashion-forward apparel from Calgary.',
  path: '/blog',
  ogImageAlt: 'FITAURA Journal — style, movement and activewear expertise.',
  absoluteTitle: true,
  keywordCluster: ['primary', 'longtail', 'expertise'],
});

const blogIndexSchema = generateWebPageSchema({
  name: 'FITAURA Journal',
  description:
    'Editorials on gymwear, athleisure and modern lifestyle clothing — fit, fabric, movement and confidence.',
  url: `${SITE_URL}/blog`,
  type: 'CollectionPage',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={blogIndexSchema} />
      {children}
    </>
  );
}
