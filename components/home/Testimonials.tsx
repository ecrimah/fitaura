import { getHomepageTestimonials, type HomepageTestimonial } from '@/lib/homepage-content';
import TestimonialStrip from './TestimonialStrip';

// Fallback used when Supabase isn't reachable / table is empty.
// Mirrors the FITAURA seed rows so the strip never renders blank.
const FALLBACK: HomepageTestimonial[] = [
  {
    id: 'fallback-1',
    quote: 'FITAURA makes me feel confident, comfortable and unstoppable. Every piece is a reminder of my strength.',
    author: 'Ana M.',
    meta: 'Verified Customer',
    rating: 5,
    avatarUrl: null,
  },
  {
    id: 'fallback-2',
    quote: 'The fit, the feel, the finish — everything about FITAURA is considered. I genuinely live in their pieces.',
    author: 'Jordan R.',
    meta: 'Verified Customer',
    rating: 5,
    avatarUrl: null,
  },
  {
    id: 'fallback-3',
    quote: 'Premium quality without the pretension. These pieces move with me from studio to street.',
    author: 'Naomi T.',
    meta: 'Verified Customer',
    rating: 5,
    avatarUrl: null,
  },
];

export default async function Testimonials() {
  const fetched = await getHomepageTestimonials();
  const testimonials = fetched.length ? fetched : FALLBACK;
  return <TestimonialStrip testimonials={testimonials} />;
}
