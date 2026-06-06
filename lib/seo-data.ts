/**
 * Server-side data fetchers for SEO structured data (ItemList, counts).
 * Kept separate from UI data hooks so schema generation stays fast and
 * cacheable at the layout/page level.
 */

import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from './seo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getClient() {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_PROJECT_REF')) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export interface SeoProductItem {
  name: string;
  slug: string;
  url: string;
  image?: string;
  position: number;
}

export interface SeoCategoryItem {
  name: string;
  slug: string;
  url: string;
  image?: string;
  position: number;
}

/** Top active products for homepage / shop ItemList schema. */
export async function fetchSeoProductList(limit = 12): Promise<SeoProductItem[]> {
  const supabase = getClient();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('products')
      .select('name, slug, product_images(url, position)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data ?? []).map((p: any, idx: number) => {
      const images = (p.product_images ?? []).sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
      );
      const img = images[0]?.url;
      return {
        name: p.name,
        slug: p.slug,
        url: `${SITE_URL}/product/${p.slug}`,
        image: img?.startsWith('http') ? img : img ? `${SITE_URL}${img}` : undefined,
        position: idx + 1,
      };
    });
  } catch {
    return [];
  }
}

/** Active categories for CollectionPage / ItemList schema. */
export async function fetchSeoCategoryList(): Promise<SeoCategoryItem[]> {
  const supabase = getClient();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from('categories')
      .select('name, slug, image_url')
      .eq('status', 'active')
      .order('position', { ascending: true });

    return (data ?? []).map((c: any, idx: number) => ({
      name: c.name,
      slug: c.slug,
      url: `${SITE_URL}/shop?category=${encodeURIComponent(c.slug)}`,
      image: c.image_url?.startsWith('http') ? c.image_url : c.image_url ? `${SITE_URL}${c.image_url}` : undefined,
      position: idx + 1,
    }));
  } catch {
    return [];
  }
}

export async function fetchActiveProductCount(): Promise<number> {
  const supabase = getClient();
  if (!supabase) return 0;

  try {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
    return count ?? 0;
  } catch {
    return 0;
  }
}
