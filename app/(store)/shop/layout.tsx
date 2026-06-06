import type { Metadata } from 'next';
import { buildPageMetadata, FOCUS_META_DESCRIPTION } from '@/lib/seo';
import { fetchActiveProductCount, fetchSeoProductList } from '@/lib/seo-data';
import StructuredData from '@/components/StructuredData';
import { generateCollectionPageSchema, generateItemListSchema } from '@/lib/seo-schemas';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shop Gymwear, Athleisure & Fashion-Forward Apparel | FITAURA',
  description: FOCUS_META_DESCRIPTION,
  path: '/shop',
  ogImageAlt: 'Shop FITAURA gymwear, athleisure and modern lifestyle clothing.',
  absoluteTitle: true,
  keywordCluster: ['primary', 'commerce'],
});

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [count, products] = await Promise.all([
    fetchActiveProductCount(),
    fetchSeoProductList(24),
  ]);

  const collectionSchema = generateCollectionPageSchema({
    name: 'Shop All — Gymwear, Athleisure & Lifestyle',
    description:
      'Browse the full FITAURA collection of modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel designed in Calgary.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com'}/shop`,
    numberOfItems: count || products.length,
  });

  const itemListSchema =
    products.length > 0 ? generateItemListSchema(products) : null;

  return (
    <>
      <StructuredData data={collectionSchema} />
      {itemListSchema ? <StructuredData data={itemListSchema} /> : null}
      {children}
    </>
  );
}
