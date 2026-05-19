-- ============================================================================
-- FITAURA · RELOCATE HERO MEDIA PATHS  (cache-burst migration)
--
-- The 9 AI-generated hero photographs were previously stored in /public/*.jpg
-- but shared their filenames with the previous owner's perfume photography.
-- Aggressive Cache-Control headers + the service worker's Cache-First image
-- strategy meant existing browsers happily served the cached perfume images
-- forever.
--
-- They have been moved to /public/brand/*.jpg. This migration rewrites every
-- row that referenced the old root-level path so the storefront serves the
-- correct FITAURA photography (or, after `npm run upload-media`, the Supabase
-- Storage URL — this migration's UPDATEs are no-ops once the script has run).
--
-- Idempotent.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. cms_content image_url
-- ----------------------------------------------------------------------------
UPDATE public.cms_content
SET image_url = '/brand/' || ltrim(image_url, '/'),
    updated_at = now()
WHERE image_url IN (
  '/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg',
  '/about-hero.jpg', '/shop-hero.jpg', '/categories-hero.jpg',
  '/contact-hero.jpg', '/wishlist-hero.jpg', '/cart-hero.jpg'
);

-- ----------------------------------------------------------------------------
-- 2. categories image_url
-- ----------------------------------------------------------------------------
UPDATE public.categories
SET image_url = '/brand/' || ltrim(image_url, '/'),
    updated_at = now()
WHERE image_url IN (
  '/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg',
  '/about-hero.jpg', '/shop-hero.jpg', '/categories-hero.jpg',
  '/contact-hero.jpg', '/wishlist-hero.jpg', '/cart-hero.jpg'
);

-- ----------------------------------------------------------------------------
-- 3. product_images url
-- ----------------------------------------------------------------------------
UPDATE public.product_images
SET url = '/brand/' || ltrim(url, '/')
WHERE url IN (
  '/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg',
  '/about-hero.jpg', '/shop-hero.jpg', '/categories-hero.jpg',
  '/contact-hero.jpg', '/wishlist-hero.jpg', '/cart-hero.jpg'
);
