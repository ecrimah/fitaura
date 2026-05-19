/**
 * FITAURA — Homepage content service (server-side reads from cms_content + categories).
 *
 * Every function returns a typed shape ready for the matching component, with
 * a safe empty fallback when Supabase isn't reachable or no rows exist yet.
 * The components are responsible for falling back to their own hardcoded
 * defaults when these return empty.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ----------------------------------------------------------------------------
// Hero slides
// ----------------------------------------------------------------------------
export interface HeroSlide {
    eyebrow: string;
    headlineTop: string;
    headlineBottom: string;
    copy: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
    image: string;
    imageAlt: string;
}

export async function getHomepageHeroSlides(): Promise<HeroSlide[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('cms_content')
            .select('title, subtitle, content, image_url, button_text, button_url, metadata, sort_order')
            .eq('section', 'homepage_hero')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error || !data) return [];
        return data.map((row): HeroSlide => {
            const meta = (row.metadata ?? {}) as Record<string, unknown>;
            return {
                eyebrow: String(meta.eyebrow ?? ''),
                headlineTop: row.title ?? '',
                headlineBottom: row.subtitle ?? '',
                copy: row.content ?? '',
                primary: {
                    label: row.button_text ?? 'Shop Now',
                    href: row.button_url ?? '/shop',
                },
                secondary: {
                    label: String(meta.secondary_label ?? 'Learn More'),
                    href: String(meta.secondary_href ?? '/about'),
                },
                image: row.image_url ?? '/brand/hero-1.jpg',
                imageAlt: String(meta.image_alt ?? 'FITAURA model'),
            };
        });
    } catch {
        return [];
    }
}

// ----------------------------------------------------------------------------
// Brand-story block
// ----------------------------------------------------------------------------
export interface BrandStoryValueProp {
    icon: string;
    title: string;
    body: string;
}

export interface BrandStoryBlock {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    content: string;
    imageUrl: string;
    imageAlt: string;
    buttonText: string;
    buttonUrl: string;
    valueProps: BrandStoryValueProp[];
}

export async function getBrandStoryBlock(): Promise<BrandStoryBlock | null> {
    if (!isSupabaseConfigured) return null;
    try {
        const { data, error } = await supabase
            .from('cms_content')
            .select('title, subtitle, content, image_url, button_text, button_url, metadata')
            .eq('section', 'homepage')
            .eq('block_key', 'brand_story')
            .eq('is_active', true)
            .maybeSingle();
        if (error || !data) return null;
        const meta = (data.metadata ?? {}) as Record<string, unknown>;
        const rawProps = Array.isArray(meta.value_props) ? (meta.value_props as unknown[]) : [];
        const valueProps: BrandStoryValueProp[] = rawProps.map((p) => {
            const v = (p ?? {}) as Record<string, unknown>;
            return {
                icon: String(v.icon ?? 'ri-leaf-line'),
                title: String(v.title ?? ''),
                body: String(v.body ?? ''),
            };
        });
        return {
            eyebrow: String(meta.eyebrow ?? 'Our Story'),
            titleTop: data.title ?? 'BUILT FOR',
            titleBottom: data.subtitle ?? 'EVERY AURA.',
            content: data.content ?? '',
            imageUrl: data.image_url ?? '/brand/about-hero.jpg',
            imageAlt: String(meta.image_alt ?? 'FITAURA brand story'),
            buttonText: data.button_text ?? 'Learn More About Us',
            buttonUrl: data.button_url ?? '/about',
            valueProps,
        };
    } catch {
        return null;
    }
}

// ----------------------------------------------------------------------------
// Homepage categories
// ----------------------------------------------------------------------------
export interface HomepageCategory {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
}

export async function getHomepageCategories(limit = 5): Promise<HomepageCategory[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, position')
            .eq('status', 'active')
            .order('position', { ascending: true })
            .limit(limit);
        if (error || !data) return [];
        return data.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            imageUrl: row.image_url ?? '/brand/hero-1.jpg',
        }));
    } catch {
        return [];
    }
}

// ----------------------------------------------------------------------------
// Testimonials
// ----------------------------------------------------------------------------
export interface HomepageTestimonial {
    id: string;
    quote: string;
    author: string;
    meta: string;
    rating: number;
    avatarUrl: string | null;
}

export async function getHomepageTestimonials(limit = 10): Promise<HomepageTestimonial[]> {
    if (!isSupabaseConfigured) return [];
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('id, author, meta, quote, rating, avatar_url, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .limit(limit);
        if (error || !data) return [];
        return data.map((row) => ({
            id: row.id,
            author: row.author,
            meta: row.meta ?? 'Verified Customer',
            quote: row.quote,
            rating: row.rating ?? 5,
            avatarUrl: row.avatar_url ?? null,
        }));
    } catch {
        return [];
    }
}
