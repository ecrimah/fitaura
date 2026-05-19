'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip the network call when Supabase env vars are still placeholders
    // — the section gracefully falls back to the local placeholder grid.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);
        if (error) throw error;
        setProducts(data || []);
      } catch {
        // Silently fall back to placeholder products — production builds
        // already render valid UI without a live DB.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-cream-50 py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

        <div className="text-center mb-12 lg:mb-16">
          <span className="eyebrow mb-3 block">New Arrivals</span>
          <h2 className="font-display text-[36px] sm:text-[48px] lg:text-[56px] leading-[0.95] text-ink-900 tracking-tight">
            JUST IN
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6">
            {products.map((product) => {
              const variants = product.product_variants || [];
              const hasVariants = variants.length > 0;
              const minVariantPrice = hasVariants
                ? Math.min(...variants.map((v: any) => v.price || product.price))
                : undefined;
              const totalStock = hasVariants
                ? variants.reduce((s: number, v: any) => s + (v.quantity || 0), 0)
                : 0;
              const effectiveStock = hasVariants ? totalStock : product.quantity;

              const colorVariants: ColorVariant[] = [];
              const seen = new Set<string>();
              for (const v of variants) {
                const colorName = (v as any).option2;
                if (colorName && !seen.has(colorName.toLowerCase().trim())) {
                  const hex = getColorHex(colorName);
                  if (hex) {
                    seen.add(colorName.toLowerCase().trim());
                    colorVariants.push({ name: colorName.trim(), hex });
                  }
                }
              }

              const createdAt = product.created_at ? new Date(product.created_at) : null;
              const isNew = createdAt
                ? (Date.now() - createdAt.getTime()) < 1000 * 60 * 60 * 24 * 30
                : false;

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.compare_at_price}
                  image={product.product_images?.[0]?.url || 'https://via.placeholder.com/400x500.png?text=Image'}
                  badge={isNew ? 'New' : undefined}
                  inStock={effectiveStock > 0}
                  maxStock={effectiveStock || 50}
                  moq={product.moq || 1}
                  hasVariants={hasVariants}
                  minVariantPrice={minVariantPrice}
                  colorVariants={colorVariants}
                />
              );
            })}
          </div>
        ) : (
          /* Placeholder grid shown when there are no products yet */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6">
            {[
              { name: 'Flow Sculpt Bra', price: '$48.00', image: '/brand/hero-1.jpg' },
              { name: 'Elevate Leggings', price: '$68.00', image: '/brand/hero-2.jpg' },
              { name: 'Aura Half Zip', price: '$62.00', image: '/brand/hero-3.jpg' },
              { name: 'FITAURA Cap', price: '$28.00', image: '/brand/shop-hero.jpg' },
            ].map((p) => (
              <article key={p.name} className="group">
                <Link href="/shop" className="block relative aspect-[4/5] overflow-hidden bg-cream-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- placeholder local image, safe */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-ink-900 text-cream-50 text-[9px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Add to wishlist"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream-50/95 hover:bg-cream-50 text-ink-700 hover:text-sienna-500 flex items-center justify-center transition-colors"
                  >
                    <i className="ri-heart-line text-sm"></i>
                  </button>
                </Link>
                <div className="mt-4 px-1">
                  <h3 className="text-[15px] text-ink-900 font-medium">{p.name}</h3>
                  <p className="text-[14px] text-ink-700 mt-1">{p.price}</p>
                  <div className="flex gap-1.5 mt-3">
                    {['#D14F2B', '#92301A', '#26261F', '#E5D2B8'].slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-ink-200/60"
                        style={{ backgroundColor: c }}
                        aria-hidden
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-14 lg:mt-16">
          <Link
            href="/shop"
            className="inline-flex items-center border border-ink-700 hover:bg-ink-900 hover:text-cream-50 text-ink-700 px-8 py-3.5 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
