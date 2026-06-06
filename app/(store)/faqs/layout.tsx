import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { FAQ_ITEMS } from '@/lib/faq-data';
import StructuredData from '@/components/StructuredData';
import { generateFAQSchema, generateWebPageSchema } from '@/lib/seo-schemas';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQs — Gymwear, Athleisure Sizing, Shipping & Returns | FITAURA',
  description:
    'Expert answers on FITAURA gymwear and athleisure — sizing, fabrics, fit, squat-proof leggings, care, shipping, returns and payment. Modern lifestyle clothing, explained.',
  path: '/faqs',
  ogImageAlt: 'FITAURA FAQs — gymwear, athleisure and lifestyle clothing help.',
  absoluteTitle: true,
  keywordCluster: ['expertise', 'commerce'],
});

const faqSchema = generateFAQSchema(
  FAQ_ITEMS.map((f) => ({ question: f.question, answer: f.answer })),
);

const faqPageSchema = generateWebPageSchema({
  name: 'FITAURA FAQs — Gymwear & Athleisure Help',
  description: 'Sizing, materials, shipping and returns for FITAURA modern lifestyle clothing.',
  url: `${SITE_URL}/faqs`,
  type: 'FAQPage',
});

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={faqPageSchema} />
      <StructuredData data={faqSchema} />
      {children}
    </>
  );
}
