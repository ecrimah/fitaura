import type { Metadata } from 'next';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sustainability — Slow Fashion Activewear | FITAURA',
  description:
    'How FITAURA builds sustainable gymwear and athleisure — considered fabrics, small-batch runs, longevity-first design. Slow fashion modern lifestyle clothing from Calgary.',
  path: '/sustainability',
  keywordCluster: ['expertise', 'longtail'],
  absoluteTitle: true,
});

const schema = generateWebPageSchema({
  name: 'FITAURA Sustainability — Slow Fashion Activewear',
  description: 'Materials, production and longevity approach for FITAURA athleisure.',
  url: `${SITE_URL}/sustainability`,
});

export default function SustainabilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={schema} />
      {children}
    </>
  );
}
