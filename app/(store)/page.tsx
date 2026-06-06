import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import JoinCommunity from '@/components/home/JoinCommunity';
import ValuePropsStrip from '@/components/home/ValuePropsStrip';
import { buildPageMetadata, FOCUS_META_DESCRIPTION, SITE_NAME, SITE_TAGLINE_SHORT, SITE_URL } from '@/lib/seo';
import { fetchSeoProductList } from '@/lib/seo-data';
import StructuredData from '@/components/StructuredData';
import { generateWebPageSchema, generateItemListSchema } from '@/lib/seo-schemas';

export const metadata = buildPageMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE_SHORT}`,
  description: FOCUS_META_DESCRIPTION,
  path: '/',
  ogImageAlt: 'FITAURA — modern lifestyle clothing, gymwear, athleisure and fashion-forward apparel.',
  absoluteTitle: true,
  keywordCluster: ['primary', 'commerce'],
});

export default async function HomePage() {
  const products = await fetchSeoProductList(8);

  const webPageSchema = generateWebPageSchema({
    name: `${SITE_NAME} — Modern Lifestyle Clothing, Gymwear & Athleisure`,
    description: FOCUS_META_DESCRIPTION,
    url: SITE_URL,
    type: 'WebPage',
    speakableSelectors: ['h1', '[data-hero-headline]'],
  });

  const itemListSchema =
    products.length > 0
      ? generateItemListSchema(
          products.map((p) => ({
            name: p.name,
            url: p.url,
            image: p.image,
            position: p.position,
          })),
        )
      : null;

  return (
    <>
      <StructuredData data={webPageSchema} />
      {itemListSchema ? <StructuredData data={itemListSchema} /> : null}
      <main className="bg-cream-50 text-ink-900">
        <Hero />
        <CategoryGrid />
        <NewArrivalsSection />
        <JoinCommunity />
        <ValuePropsStrip />
      </main>
    </>
  );
}
