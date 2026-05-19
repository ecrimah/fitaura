-- ============================================================================
-- FITAURA · BRAND COPY REFRESH
--
-- Re-upserts the homepage hero slides and brand-story block with the
-- finalised FITAURA voice: "modern lifestyle clothing — gymwear, athleisure
-- and fashion-forward apparel built to empower confidence and comfort."
--
-- The original seed migration (20260521000000) won't replay on databases
-- where it's already been applied, so this file ensures existing projects
-- pick up the new copy. Idempotent via ON CONFLICT (section, block_key).
-- ============================================================================

INSERT INTO public.cms_content
  (section, block_key, title, subtitle, content, image_url,
   button_text, button_url, metadata, sort_order, is_active)
VALUES
  ('homepage_hero', 'slide_1',
   'MORE THAN',
   'GYMWEAR.',
   'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort.',
   '/brand/hero-1.jpg',
   'Shop Now', '/shop',
   jsonb_build_object(
     'eyebrow',          'Modern lifestyle clothing',
     'secondary_label',  'New Arrivals',
     'secondary_href',   '/shop?sort=newest',
     'image_alt',        'FITAURA model in modern lifestyle activewear'
   ),
   1, true),

  ('homepage_hero', 'slide_2',
   'BUILT TO',
   'MOVE WITH YOU',
   'Sculpted fabrics and functional fits — designed for studio sessions, long runs and slow Calgary mornings.',
   '/brand/hero-2.jpg',
   'Shop Lounge', '/shop?category=loungewear',
   jsonb_build_object(
     'eyebrow',          'Lounge / Lifestyle',
     'secondary_label',  'Our Story',
     'secondary_href',   '/about',
     'image_alt',        'FITAURA model in lounge / lifestyle apparel'
   ),
   2, true),

  ('homepage_hero', 'slide_3',
   'STRONG.',
   'SOFT. YOU.',
   'Warm tones, soft knits and confident silhouettes for every season of you — and every season of FITAURA.',
   '/brand/hero-3.jpg',
   'Shop the Edit', '/shop',
   jsonb_build_object(
     'eyebrow',          'Confidence in comfort',
     'secondary_label',  'Discover Collections',
     'secondary_href',   '/categories',
     'image_alt',        'FITAURA model in fashion-forward loungewear'
   ),
   3, true),

  ('homepage', 'brand_story',
   'BUILT FOR',
   'EVERY AURA.',
   'FITAURA is a modern lifestyle clothing brand offering gymwear, athleisure and fashion-forward apparel — designed to empower confidence and comfort. Our roots are in performance, but our vision is bigger: a full wardrobe for every part of your day.',
   '/brand/about-hero.jpg',
   'Discover Our Story', '/about',
   jsonb_build_object(
     'eyebrow',   'Designed in Calgary',
     'image_alt', 'FITAURA brand portrait — built for every aura',
     'value_props', jsonb_build_array(
       jsonb_build_object('icon','ri-pulse-line',     'title','Built To Move',        'body','Performance gymwear engineered for studio days and beyond.'),
       jsonb_build_object('icon','ri-sparkling-2-line','title','Fashion-Forward',     'body','Athleisure that wears just as well with denim and boots.'),
       jsonb_build_object('icon','ri-heart-3-line',   'title','Confidence In Comfort','body','Silhouettes designed to celebrate strength and ease.')
     )
   ),
   0, true)
ON CONFLICT (section, block_key) DO UPDATE
SET title       = EXCLUDED.title,
    subtitle    = EXCLUDED.subtitle,
    content     = EXCLUDED.content,
    image_url   = EXCLUDED.image_url,
    button_text = EXCLUDED.button_text,
    button_url  = EXCLUDED.button_url,
    metadata    = EXCLUDED.metadata,
    sort_order  = EXCLUDED.sort_order,
    is_active   = EXCLUDED.is_active,
    updated_at  = now();
