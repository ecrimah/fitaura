import type { Metadata } from 'next';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { fetchSeoCategoryList } from '@/lib/seo-data';
import StructuredData from '@/components/StructuredData';
import { generateCollectionPageSchema, generateItemListSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Collections — Lounge, Gymwear, Athleisure & Accessories | FITAURA',
  description:
    'Browse FITAURA collections — lounge & lifestyle, gymwear, athleisure, new arrivals and accessories. Modern lifestyle clothing designed in Calgary for confidence in comfort.',
  path: '/categories',
  ogImageAlt: 'FITAURA collections — gymwear, athleisure and lifestyle apparel.',
  absoluteTitle: true,
  keywordCluster: ['primary', 'commerce'],
});

export default async function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const categories = await fetchSeoCategoryList();

  const collectionSchema = generateCollectionPageSchema({
    name: 'FITAURA Collections',
    description:
      'Shop by category — lounge, gymwear, athleisure, new arrivals and fashion-forward accessories.',
    url: `${SITE_URL}/categories`,
    numberOfItems: categories.length,
  });

  const itemListSchema =
    categories.length > 0 ? generateItemListSchema(categories) : null;

  return (
    <>
      <StructuredData data={collectionSchema} />
      {itemListSchema ? <StructuredData data={itemListSchema} /> : null}
      {children}
    </>
  );
}
