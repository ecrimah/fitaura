import type { Metadata } from 'next';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Care Guide — How to Keep Your Gymwear & Athleisure | FITAURA',
  description:
    'Expert care guide for FITAURA gymwear and athleisure — wash cold, skip softener, preserve stretch. Keep your fashion-forward apparel performing for years.',
  path: '/care-guide',
  keywordCluster: 'expertise',
  absoluteTitle: true,
});

const schema = generateWebPageSchema({
  name: 'FITAURA Care Guide — Activewear & Athleisure Care',
  description: 'How to wash, dry and store FITAURA modern lifestyle clothing.',
  url: `${SITE_URL}/care-guide`,
});

export default function CareGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={schema} />
      {children}
    </>
  );
}
