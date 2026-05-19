import { getHomepageHeroSlides, type HeroSlide } from '@/lib/homepage-content';
import HeroCarousel from './HeroCarousel';

// Fallback used when Supabase isn't reachable / cms_content has no rows yet.
// Kept aligned with the homepage_cms migration seed values.
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    eyebrow: 'Modern lifestyle clothing',
    headlineTop: 'MORE THAN',
    headlineBottom: 'GYMWEAR.',
    copy: 'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort.',
    primary: { label: 'Shop Now', href: '/shop' },
    secondary: { label: 'New Arrivals', href: '/shop?sort=newest' },
    image: '/brand/hero-1.jpg',
    imageAlt: 'FITAURA model in modern lifestyle activewear',
  },
  {
    eyebrow: 'Lounge / Lifestyle',
    headlineTop: 'BUILT TO',
    headlineBottom: 'MOVE WITH YOU',
    copy: 'Sculpted fabrics and functional fits — designed for studio sessions, long runs and slow Calgary mornings.',
    primary: { label: 'Shop Lounge', href: '/shop?category=loungewear' },
    secondary: { label: 'Our Story', href: '/about' },
    image: '/brand/hero-2.jpg',
    imageAlt: 'FITAURA model in lounge / lifestyle apparel',
  },
  {
    eyebrow: 'Confidence in comfort',
    headlineTop: 'STRONG.',
    headlineBottom: 'SOFT. YOU.',
    copy: 'Warm tones, soft knits and confident silhouettes for every season of you — and every season of FITAURA.',
    primary: { label: 'Shop the Edit', href: '/shop' },
    secondary: { label: 'Discover Collections', href: '/categories' },
    image: '/brand/hero-3.jpg',
    imageAlt: 'FITAURA model in fashion-forward loungewear',
  },
];

export default async function Hero() {
  const slides = await getHomepageHeroSlides();
  return <HeroCarousel slides={slides.length ? slides : FALLBACK_SLIDES} />;
}
