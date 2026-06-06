import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { generateAboutPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'About FITAURA — Modern Lifestyle Clothing from Calgary',
  description:
    'FITAURA is a Calgary-based modern lifestyle clothing brand — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort across Canada.',
  path: '/about',
  ogImageAlt: 'About FITAURA — Canadian gymwear and athleisure brand from Calgary.',
  absoluteTitle: true,
  keywordCluster: ['primary', 'expertise'],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={generateAboutPageSchema()} />
      {children}
    </>
  );
}
