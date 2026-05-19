-- ============================================================================
-- FITAURA · DEMO PRODUCT SEED
--
-- Optional migration that seeds the storefront with FITAURA-themed demo
-- categories, products, variants, and product images so the homepage
-- "New Arrivals" / shop / category pages immediately come alive.
--
-- Safe to run multiple times — all inserts use `ON CONFLICT DO NOTHING`.
--
-- Image URLs point at /public hero placeholder files that ship with the
-- repo, so they render without any external CDN or storage upload.
-- Replace them with real product photography once you have it.
--
-- To skip seed data on production: delete this file before running
--   `npm run supabase:migrate`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, image_url, status, position)
VALUES
  ('Activewear',  'activewear',  'Sports bras, leggings and tops engineered for movement.',           '/brand/hero-1.jpg',       'active', 10),
  ('Loungewear',  'loungewear',  'Soft, sculpted pieces for slow mornings and recovery days.',         '/brand/hero-2.jpg',       'active', 20),
  ('Accessories', 'accessories', 'Caps, bags and finishing details that complete the look.',          '/brand/hero-3.jpg',       'active', 30),
  ('Outerwear',   'outerwear',   'Layers built for studio-to-street confidence.',                     '/brand/shop-hero.jpg',    'active', 40),
  ('Essentials',  'essentials',  'Wardrobe staples reimagined in the FITAURA palette.',               '/brand/categories-hero.jpg','active', 50)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Products  — keep IDs stable via slugs; use CTE to look up category ids
-- ----------------------------------------------------------------------------
WITH cats AS (
  SELECT id, slug FROM public.categories
    WHERE slug IN ('activewear', 'loungewear', 'accessories', 'outerwear', 'essentials')
)
INSERT INTO public.products
  (name, slug, description, short_description, price, compare_at_price, sku,
   quantity, track_quantity, category_id, brand, tags, status, featured,
   options, seo_title, seo_description, moq)
VALUES
  -- Activewear
  ('Flow Sculpt Bra',     'flow-sculpt-bra',
   'Buttery-soft seamless support that moves with you. Medium impact, removable cups, signature sienna trim.',
   'Medium-impact seamless bra.',
   48.00, 60.00, 'STORE-FSB-001', 240, true,
   (SELECT id FROM cats WHERE slug = 'activewear'),
   'FITAURA', ARRAY['bra', 'seamless', 'medium-impact', 'new'],
   'active', true,
   '[{"name":"Size","values":["XS","S","M","L","XL"]},{"name":"Color","values":["Sienna","Brown","Black","Cream"]}]'::jsonb,
   'Flow Sculpt Bra — Medium Impact Seamless | FITAURA',
   'Medium-impact, buttery-soft seamless sports bra from the FITAURA studio collection.', 1),

  ('Elevate Leggings',    'elevate-leggings',
   'High-rise sculpting leggings with a wide waistband and gusset for total freedom of movement. Squat-proof guaranteed.',
   'High-rise sculpting legging.',
   68.00, 80.00, 'STORE-ELG-001', 320, true,
   (SELECT id FROM cats WHERE slug = 'activewear'),
   'FITAURA', ARRAY['leggings', 'high-rise', 'sculpting', 'bestseller'],
   'active', true,
   '[{"name":"Size","values":["XS","S","M","L","XL"]},{"name":"Color","values":["Brown","Black","Cream"]}]'::jsonb,
   'Elevate Leggings — High Rise Sculpt | FITAURA',
   'Squat-proof, high-rise sculpting leggings in our warmest tones.', 1),

  ('Studio Wrap Top',     'studio-wrap-top',
   'A featherweight wrap top for warm-ups, pilates, and slow flow. Ribbed knit. Long-sleeve.',
   'Ribbed wrap top.',
   55.00, NULL, 'STORE-SWT-001', 150, true,
   (SELECT id FROM cats WHERE slug = 'activewear'),
   'FITAURA', ARRAY['top', 'ribbed', 'long-sleeve', 'new'],
   'active', true,
   '[{"name":"Size","values":["XS","S","M","L"]},{"name":"Color","values":["Sienna","Cream"]}]'::jsonb,
   'Studio Wrap Top — Ribbed Long Sleeve | FITAURA',
   'Lightweight ribbed wrap top in soft FITAURA tones.', 1),

  ('Essential Tank',      'essential-tank',
   'The everyday tank. Soft-jersey, slightly cropped, and built to layer.',
   'Cropped soft-jersey tank.',
   32.00, NULL, 'STORE-ETK-001', 400, true,
   (SELECT id FROM cats WHERE slug = 'essentials'),
   'FITAURA', ARRAY['tank', 'cropped', 'essential'],
   'active', false,
   '[{"name":"Size","values":["XS","S","M","L","XL"]},{"name":"Color","values":["Black","Brown","Cream","Sienna"]}]'::jsonb,
   'Essential Tank — Cropped Soft Jersey | FITAURA',
   'Wardrobe-staple cropped tank in our signature warm tones.', 1),

  -- Loungewear
  ('Aura Half Zip',       'aura-half-zip',
   'The half-zip you live in. Brushed-back fleece, drop shoulders, longer hem.',
   'Brushed-back half-zip pullover.',
   62.00, NULL, 'STORE-AHZ-001', 180, true,
   (SELECT id FROM cats WHERE slug = 'loungewear'),
   'FITAURA', ARRAY['half-zip', 'fleece', 'loungewear', 'new'],
   'active', true,
   '[{"name":"Size","values":["XS","S","M","L","XL"]},{"name":"Color","values":["Cream","Brown"]}]'::jsonb,
   'Aura Half Zip — Brushed Fleece | FITAURA',
   'Cozy brushed half-zip in the FITAURA loungewear capsule.', 1),

  ('Cloud Lounge Set',    'cloud-lounge-set',
   'Matching cropped tee + wide-leg pant set in cloud-soft modal. Made for slow mornings.',
   'Modal lounge set (top + pant).',
   98.00, 120.00, 'STORE-CLS-001', 90, true,
   (SELECT id FROM cats WHERE slug = 'loungewear'),
   'FITAURA', ARRAY['set', 'modal', 'lounge'],
   'active', true,
   '[{"name":"Size","values":["S","M","L","XL"]},{"name":"Color","values":["Cream","Sienna"]}]'::jsonb,
   'Cloud Lounge Set — Modal Set | FITAURA',
   'Matching cropped tee and wide-leg pant in cloud-soft modal.', 1),

  -- Outerwear
  ('Aura Crop Hoodie',    'aura-crop-hoodie',
   'A relaxed crop hoodie with our signature kangaroo pocket and warm-toned drawstring.',
   'Relaxed crop hoodie.',
   78.00, NULL, 'STORE-ACH-001', 140, true,
   (SELECT id FROM cats WHERE slug = 'outerwear'),
   'FITAURA', ARRAY['hoodie', 'crop', 'outerwear'],
   'active', false,
   '[{"name":"Size","values":["XS","S","M","L","XL"]},{"name":"Color","values":["Brown","Black","Cream"]}]'::jsonb,
   'Aura Crop Hoodie | FITAURA',
   'Relaxed crop hoodie in soft warm-toned cotton.', 1),

  -- Accessories
  ('FITAURA Cap',         'fitaura-cap',
   'A clean six-panel cap with our signature embroidered mark. One-size adjustable strap.',
   'Embroidered six-panel cap.',
   28.00, NULL, 'STORE-FCP-001', 220, true,
   (SELECT id FROM cats WHERE slug = 'accessories'),
   'FITAURA', ARRAY['cap', 'accessories'],
   'active', true,
   '[{"name":"Size","values":["One Size"]},{"name":"Color","values":["Black","Cream","Brown"]}]'::jsonb,
   'FITAURA Cap | Embroidered Six-Panel',
   'Six-panel cap with embroidered FITAURA mark.', 1)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Product images
-- ----------------------------------------------------------------------------
WITH p AS (SELECT id, slug FROM public.products WHERE slug IN (
  'flow-sculpt-bra','elevate-leggings','studio-wrap-top','essential-tank',
  'aura-half-zip','cloud-lounge-set','aura-crop-hoodie','fitaura-cap'
))
INSERT INTO public.product_images (product_id, url, alt_text, position)
SELECT id, '/brand/hero-1.jpg',       'Flow Sculpt Bra — primary image',    0 FROM p WHERE slug = 'flow-sculpt-bra'
UNION ALL
SELECT id, '/brand/hero-2.jpg',       'Elevate Leggings — primary image',   0 FROM p WHERE slug = 'elevate-leggings'
UNION ALL
SELECT id, '/brand/hero-3.jpg',       'Studio Wrap Top — primary image',    0 FROM p WHERE slug = 'studio-wrap-top'
UNION ALL
SELECT id, '/brand/cart-hero.jpg',    'Essential Tank — primary image',     0 FROM p WHERE slug = 'essential-tank'
UNION ALL
SELECT id, '/brand/wishlist-hero.jpg','Aura Half Zip — primary image',      0 FROM p WHERE slug = 'aura-half-zip'
UNION ALL
SELECT id, '/brand/about-hero.jpg',   'Cloud Lounge Set — primary image',   0 FROM p WHERE slug = 'cloud-lounge-set'
UNION ALL
SELECT id, '/brand/contact-hero.jpg', 'Aura Crop Hoodie — primary image',   0 FROM p WHERE slug = 'aura-crop-hoodie'
UNION ALL
SELECT id, '/brand/shop-hero.jpg',    'FITAURA Cap — primary image',        0 FROM p WHERE slug = 'fitaura-cap'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Product variants  — emit one variant per (size, color) combination
--    `option1` = size, `option2` = color  (matches storefront convention)
-- ----------------------------------------------------------------------------

-- Flow Sculpt Bra  — 5 sizes × 4 colors = 20 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-FSB-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  48.00,
  12,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Sienna'),('Brown'),('Black'),('Cream')) AS c(color)
WHERE p.slug = 'flow-sculpt-bra'
ON CONFLICT (sku) DO NOTHING;

-- Elevate Leggings  — 5 sizes × 3 colors = 15 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-ELG-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  68.00,
  18,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Brown'),('Black'),('Cream')) AS c(color)
WHERE p.slug = 'elevate-leggings'
ON CONFLICT (sku) DO NOTHING;

-- Studio Wrap Top  — 4 sizes × 2 colors = 8 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-SWT-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  55.00,
  16,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L')) AS s(size)
CROSS JOIN (VALUES ('Sienna'),('Cream')) AS c(color)
WHERE p.slug = 'studio-wrap-top'
ON CONFLICT (sku) DO NOTHING;

-- Essential Tank  — 5 sizes × 4 colors = 20 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-ETK-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  32.00,
  20,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Black'),('Brown'),('Cream'),('Sienna')) AS c(color)
WHERE p.slug = 'essential-tank'
ON CONFLICT (sku) DO NOTHING;

-- Aura Half Zip  — 5 sizes × 2 colors = 10 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-AHZ-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  62.00,
  18,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Cream'),('Brown')) AS c(color)
WHERE p.slug = 'aura-half-zip'
ON CONFLICT (sku) DO NOTHING;

-- Cloud Lounge Set  — 4 sizes × 2 colors = 8 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-CLS-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  98.00,
  11,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Cream'),('Sienna')) AS c(color)
WHERE p.slug = 'cloud-lounge-set'
ON CONFLICT (sku) DO NOTHING;

-- Aura Crop Hoodie  — 5 sizes × 3 colors = 15 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  s.size || ' / ' || c.color,
  'STORE-ACH-' || s.size || '-' || UPPER(LEFT(c.color, 3)),
  78.00,
  9,
  s.size, c.color
FROM public.products p
CROSS JOIN (VALUES ('XS'),('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('Brown'),('Black'),('Cream')) AS c(color)
WHERE p.slug = 'aura-crop-hoodie'
ON CONFLICT (sku) DO NOTHING;

-- FITAURA Cap  — 1 size × 3 colors = 3 variants
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1, option2)
SELECT
  p.id,
  'One Size / ' || c.color,
  'STORE-FCP-OS-' || UPPER(LEFT(c.color, 3)),
  28.00,
  60,
  'One Size', c.color
FROM public.products p
CROSS JOIN (VALUES ('Black'),('Cream'),('Brown')) AS c(color)
WHERE p.slug = 'fitaura-cap'
ON CONFLICT (sku) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Backfill products.quantity from sum of variants  (so storefront sees stock)
-- ----------------------------------------------------------------------------
UPDATE public.products p
SET quantity = COALESCE(v.total, 0)
FROM (
  SELECT product_id, SUM(quantity)::int AS total
  FROM public.product_variants
  GROUP BY product_id
) v
WHERE p.id = v.product_id
  AND p.slug IN (
    'flow-sculpt-bra','elevate-leggings','studio-wrap-top','essential-tank',
    'aura-half-zip','cloud-lounge-set','aura-crop-hoodie','fitaura-cap'
  );
