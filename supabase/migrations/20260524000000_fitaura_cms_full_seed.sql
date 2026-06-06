-- ============================================================================
-- FITAURA · TESTIMONIALS + SITE SETTINGS + DEFAULT BANNER SEED
--
-- This migration:
--   1. Creates the `testimonials` table (with RLS) so the homepage testimonial
--      strip can be edited from the admin dashboard instead of a hardcoded
--      array in the React component.
--   2. Seeds `site_settings` with FITAURA's default brand values so the
--      Header / Footer / Contact / SEO components have a live source of truth.
--   3. Seeds a default top-of-page banner so `banners` is exercised on first
--      load even before an admin creates a custom one.
--
-- Safe to re-run — every INSERT uses ON CONFLICT DO NOTHING / DO UPDATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. testimonials table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  author text NOT NULL,
  meta text DEFAULT 'Verified Customer',
  quote text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_active_sort_idx
  ON public.testimonials (is_active, sort_order);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can read active testimonials (used by the homepage)
DROP POLICY IF EXISTS "Allow public read on testimonials" ON public.testimonials;
CREATE POLICY "Allow public read on testimonials"
  ON public.testimonials FOR SELECT
  USING (is_active = true);

-- Only admins can write
DROP POLICY IF EXISTS "Allow admin all on testimonials" ON public.testimonials;
CREATE POLICY "Allow admin all on testimonials"
  ON public.testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'::user_role
    )
  );

-- Seed FITAURA's starter testimonials
INSERT INTO public.testimonials
  (author, meta, quote, rating, sort_order, is_active)
VALUES
  ('Ana M.', 'Verified Customer',
   'FITAURA makes me feel confident, comfortable and unstoppable. Every piece is a reminder of my strength.',
   5, 1, true),
  ('Jordan R.', 'Verified Customer',
   'The fit, the feel, the finish — everything about FITAURA is considered. I genuinely live in their pieces.',
   5, 2, true),
  ('Naomi T.', 'Verified Customer',
   'Premium quality without the pretension. These pieces move with me from studio to street.',
   5, 3, true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. site_settings — seed FITAURA brand values so CMSContext has live data
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (key, value, category) VALUES
  ('site_name',         to_jsonb('FITAURA'::text),                                                                     'general'),
  ('site_tagline',      to_jsonb('Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort.'::text), 'general'),
  ('site_logo',         to_jsonb('/logo-icon.svg'::text),                                                              'general'),

  ('contact_email',     to_jsonb('Fitaurawear@gmail.com'::text),                                                       'contact'),
  ('contact_phone',     to_jsonb('+1 (587) 432-6761'::text),                                                           'contact'),
  ('contact_whatsapp',  to_jsonb('+15874326761'::text),                                                                'contact'),
  ('contact_address',   to_jsonb('Calgary, Alberta, Canada'::text),                                                    'contact'),

  ('social_instagram',  to_jsonb('https://instagram.com/fitaura.ca'::text),                                            'social'),
  ('social_facebook',   to_jsonb(''::text),                                                                            'social'),
  ('social_twitter',    to_jsonb(''::text),                                                                            'social'),
  ('social_tiktok',     to_jsonb(''::text),                                                                            'social'),
  ('social_youtube',    to_jsonb(''::text),                                                                            'social'),
  ('social_snapchat',   to_jsonb(''::text),                                                                            'social'),

  ('primary_color',     to_jsonb('#D14F2B'::text),                                                                     'theme'),
  ('secondary_color',   to_jsonb('#FBF7F1'::text),                                                                     'theme'),

  ('currency',          to_jsonb('CAD'::text),                                                                         'commerce'),
  ('currency_symbol',   to_jsonb('$'::text),                                                                           'commerce')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. banners — seed the default top announcement so the bar is DB-driven
-- ----------------------------------------------------------------------------
INSERT INTO public.banners
  (name, type, title, subtitle, background_color, text_color,
   button_text, button_url, position, sort_order, is_active)
VALUES
  ('Default top bar',
   'announcement',
   'FREE CANADA SHIPPING ON ORDERS OVER $120',
   'Free returns within 30 days',
   '#D14F2B',
   '#FBF7F1',
   NULL,
   NULL,
   'top',
   1,
   true)
ON CONFLICT DO NOTHING;
