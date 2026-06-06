import type { Metadata } from 'next';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Size Guide — Gymwear & Athleisure Fit | FITAURA',
  description:
    'Expert FITAURA size guide for gymwear and athleisure — leggings, sports bras, tops and joggers. Measurements and fit notes so your modern lifestyle clothing fits perfectly.',
  path: '/size-guide',
  keywordCluster: 'expertise',
  absoluteTitle: true,
});

const schema = generateWebPageSchema({
  name: 'FITAURA Size Guide — Gymwear & Athleisure Fit',
  description: 'Measurements and fit expertise for FITAURA activewear and lifestyle apparel.',
  url: `${SITE_URL}/size-guide`,
});

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={schema} />
      {children}
    </>
  );
}
