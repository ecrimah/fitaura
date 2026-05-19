import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import JoinCommunity from '@/components/home/JoinCommunity';
import ValuePropsStrip from '@/components/home/ValuePropsStrip';

// `title.absolute` bypasses the root template (`%s | FITAURA`) so the homepage
// doesn't render "FITAURA - Confidence In Motion | FITAURA".
export const metadata: Metadata = {
  title: { absolute: 'FITAURA — Confidence In Motion' },
  description:
    'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort. Designed in Calgary, shipping worldwide.',
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://shopfitaura.com' },
};

export default function HomePage() {
  return (
    <main className="bg-cream-50 text-ink-900">
      <Hero />
      <CategoryGrid />
      <NewArrivalsSection />
      <JoinCommunity />
      <ValuePropsStrip />
    </main>
  );
}
