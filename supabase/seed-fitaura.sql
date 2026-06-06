-- ============================================================================
-- FITAURA · COMBINED SEED — GENERATED 2026-05-16T12:11:29.251Z
-- 
-- Paste this entire file into the Supabase Studio SQL editor and click Run.
-- It is safe to re-run: every migration uses IF NOT EXISTS / ON CONFLICT.
-- 
-- Source migrations (run in this order):
--   01. 20260209000000_complete_schema.sql
--   02. 20260218000000_allow_null_order_items_product_fks.sql
--   03. 20260219000000_contact_submissions.sql
--   04. 20260520000000_seed_fitaura_demo_products.sql
--   05. 20260521000000_seed_fitaura_homepage_cms.sql
--   06. 20260522000000_relocate_hero_media_paths.sql
--   07. 20260523000000_refresh_fitaura_brand_copy.sql
--   08. 20260524000000_fitaura_cms_full_seed.sql
-- ============================================================================

-- ------------------------------------------------------------
-- BEGIN: 20260209000000_complete_schema.sql
-- ------------------------------------------------------------
-- ============================================================================
-- COMPLETE DATABASE SCHEMA MIGRATION
-- Generated from live Supabase database on 2026-02-09
-- 
-- This single migration creates the entire database from scratch.
-- Run this on a fresh Supabase project to get the full schema.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================================================
-- 2. CUSTOM ENUM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE address_type AS ENUM ('shipping', 'billing', 'both');
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE category_status AS ENUM ('active', 'inactive');
CREATE TYPE order_status AS ENUM ('pending', 'awaiting_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed');

-- ============================================================================
-- 3. HELPER FUNCTIONS (needed before tables for RLS policies)
-- ============================================================================

-- Check if current user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  );
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new auth user -> create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update product rating stats from reviews
CREATE OR REPLACE FUNCTION public.update_product_rating_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE products
  SET rating_avg = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'approved'
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'approved'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Upsert customer from order (deduplication logic)
CREATE OR REPLACE FUNCTION public.upsert_customer_from_order(
  p_email text,
  p_phone text,
  p_full_name text,
  p_first_name text,
  p_last_name text,
  p_user_id uuid DEFAULT NULL,
  p_address jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_customer_id UUID;
  v_existing_email TEXT;
  v_existing_phone TEXT;
  v_existing_secondary_email TEXT;
  v_existing_secondary_phone TEXT;
BEGIN
  -- Try to find existing customer by email first (check both primary and secondary)
  SELECT id, email, phone, secondary_email, secondary_phone 
  INTO v_customer_id, v_existing_email, v_existing_phone, v_existing_secondary_email, v_existing_secondary_phone 
  FROM customers 
  WHERE email = p_email OR secondary_email = p_email 
  LIMIT 1;
  
  -- If not found by email, try to find by phone number (check both primary and secondary)
  IF v_customer_id IS NULL AND p_phone IS NOT NULL AND p_phone != '' THEN
    SELECT id, email, phone, secondary_email, secondary_phone 
    INTO v_customer_id, v_existing_email, v_existing_phone, v_existing_secondary_email, v_existing_secondary_phone 
    FROM customers 
    WHERE phone = p_phone OR secondary_phone = p_phone 
    LIMIT 1;
  END IF;
  
  IF v_customer_id IS NULL THEN
    -- Create new customer only if no match found
    INSERT INTO customers (email, phone, full_name, first_name, last_name, user_id, default_address)
    VALUES (p_email, p_phone, p_full_name, p_first_name, p_last_name, p_user_id, p_address)
    RETURNING id INTO v_customer_id;
  ELSE
    -- Update existing customer with latest info
    UPDATE customers SET
      secondary_email = CASE 
        WHEN p_email IS NOT NULL 
             AND p_email != '' 
             AND p_email != v_existing_email 
             AND (v_existing_secondary_email IS NULL OR v_existing_secondary_email = '' OR v_existing_secondary_email != p_email)
        THEN p_email
        ELSE secondary_email
      END,
      secondary_phone = CASE 
        WHEN p_phone IS NOT NULL 
             AND p_phone != '' 
             AND p_phone != v_existing_phone 
             AND (v_existing_secondary_phone IS NULL OR v_existing_secondary_phone = '' OR v_existing_secondary_phone != p_phone)
        THEN p_phone
        ELSE secondary_phone
      END,
      full_name = COALESCE(NULLIF(p_full_name, ''), full_name),
      first_name = COALESCE(NULLIF(p_first_name, ''), first_name),
      last_name = COALESCE(NULLIF(p_last_name, ''), last_name),
      user_id = COALESCE(p_user_id, user_id),
      default_address = COALESCE(p_address, default_address),
      updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;
  
  RETURN v_customer_id;
END;
$$;

-- Update customer order stats
CREATE OR REPLACE FUNCTION public.update_customer_stats(p_customer_email text, p_order_total numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE customers
  SET total_orders = total_orders + 1,
      total_spent = total_spent + p_order_total,
      last_order_at = NOW(),
      updated_at = NOW()
  WHERE email = p_customer_email;
END;
$$;

-- Reduce stock on order (standalone function)
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reduce main product stock
  UPDATE products p
  SET quantity = GREATEST(p.quantity - oi.quantity, 0),
      updated_at = now()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p.id;

  -- Reduce variant stock
  UPDATE product_variants pv
  SET quantity = GREATEST(pv.quantity - oi.quantity, 0),
      updated_at = now()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = pv.product_id
    AND oi.variant_name IS NOT NULL
    AND oi.variant_name = pv.name;
END;
$$;

-- Get all customer emails (primary + secondary)
CREATE OR REPLACE FUNCTION public.get_all_customer_emails()
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT e.email
  FROM (
    SELECT c.email FROM customers c WHERE c.email IS NOT NULL AND c.email != ''
    UNION
    SELECT c.secondary_email FROM customers c WHERE c.secondary_email IS NOT NULL AND c.secondary_email != ''
  ) e
  ORDER BY e.email;
END;
$$;

-- Get all customer phones (primary + secondary)
CREATE OR REPLACE FUNCTION public.get_all_customer_phones()
RETURNS TABLE(phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.phone
  FROM (
    SELECT c.phone FROM customers c WHERE c.phone IS NOT NULL AND c.phone != ''
    UNION
    SELECT c.secondary_phone FROM customers c WHERE c.secondary_phone IS NOT NULL AND c.secondary_phone != ''
  ) p
  ORDER BY p.phone;
END;
$$;

-- ============================================================================
-- 4. TABLES
-- ============================================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE,
  role user_role DEFAULT 'customer'::user_role,
  full_name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  gender gender_type,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  type address_type DEFAULT 'shipping'::address_type,
  is_default boolean DEFAULT false,
  label text,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store Settings
CREATE TABLE public.store_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES public.categories(id),
  image_url text,
  position integer DEFAULT 0,
  status category_status DEFAULT 'active'::category_status,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric NOT NULL,
  compare_at_price numeric,
  cost_per_item numeric,
  sku text UNIQUE,
  barcode text,
  quantity integer DEFAULT 0,
  track_quantity boolean DEFAULT true,
  continue_selling boolean DEFAULT false,
  weight numeric,
  weight_unit text DEFAULT 'kg'::text,
  category_id uuid REFERENCES public.categories(id),
  brand text,
  vendor text,
  tags text[],
  status product_status DEFAULT 'active'::product_status,
  featured boolean DEFAULT false,
  options jsonb DEFAULT '[]'::jsonb,
  external_id text,
  external_source text,
  seo_title text,
  seo_description text,
  rating_avg numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  moq integer DEFAULT 1 CHECK (moq >= 1)
);
COMMENT ON COLUMN public.products.moq IS 'Minimum Order Quantity - the minimum number of units a customer must order';

-- Product Images
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  url text NOT NULL,
  alt_text text,
  position integer DEFAULT 0,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

-- Product Variants
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  name text NOT NULL,
  sku text UNIQUE,
  price numeric NOT NULL,
  compare_at_price numeric,
  cost_per_item numeric,
  quantity integer DEFAULT 0,
  weight numeric,
  option1 text,
  option2 text,
  option3 text,
  image_url text,
  barcode text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  description text,
  type discount_type NOT NULL,
  value numeric NOT NULL,
  minimum_purchase numeric DEFAULT 0,
  maximum_discount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  per_user_limit integer DEFAULT 1,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  phone text,
  status order_status DEFAULT 'pending'::order_status,
  payment_status payment_status DEFAULT 'pending'::payment_status,
  currency text DEFAULT 'USD'::text,
  subtotal numeric NOT NULL,
  tax_total numeric DEFAULT 0,
  shipping_total numeric DEFAULT 0,
  discount_total numeric DEFAULT 0,
  total numeric NOT NULL,
  shipping_method text,
  payment_method text,
  payment_provider text,
  payment_transaction_id text,
  notes text,
  cancel_reason text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  payment_reminder_sent boolean DEFAULT false,
  payment_reminder_sent_at timestamptz
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id),
  product_id uuid REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  product_name text NOT NULL,
  variant_name text,
  sku text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Order Status History
CREATE TABLE public.order_status_history (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id),
  status order_status NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Cart Items
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist Items
CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES public.products(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  user_id uuid REFERENCES auth.users(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  status review_status DEFAULT 'pending'::review_status,
  verified_purchase boolean DEFAULT false,
  helpful_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Review Images
CREATE TABLE public.review_images (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  review_id uuid REFERENCES public.reviews(id),
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blog Posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author_id uuid REFERENCES auth.users(id),
  status blog_status DEFAULT 'draft'::blog_status,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support Tickets
CREATE SEQUENCE IF NOT EXISTS support_tickets_ticket_number_seq;

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ticket_number integer NOT NULL DEFAULT nextval('support_tickets_ticket_number_seq'),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  subject text NOT NULL,
  description text,
  category text,
  status ticket_status DEFAULT 'open'::ticket_status,
  priority ticket_priority DEFAULT 'medium'::ticket_priority,
  assigned_to uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support Messages
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ticket_id uuid REFERENCES public.support_tickets(id),
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Return Requests
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id uuid REFERENCES public.orders(id),
  user_id uuid REFERENCES auth.users(id),
  status return_status DEFAULT 'pending'::return_status,
  reason text NOT NULL,
  description text,
  refund_amount numeric,
  refund_method text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Return Items
CREATE TABLE public.return_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  return_request_id uuid REFERENCES public.return_requests(id),
  order_item_id uuid REFERENCES public.order_items(id),
  quantity integer NOT NULL,
  reason text,
  condition text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pages (CMS)
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  status text DEFAULT 'draft'::text,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site Settings (key-value with category)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CMS Content blocks
CREATE TABLE public.cms_content (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  section text NOT NULL,
  block_key text NOT NULL,
  title text,
  subtitle text,
  content text,
  image_url text,
  button_text text,
  button_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, block_key)
);

-- Banners
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'promotional'::text,
  title text,
  subtitle text,
  image_url text,
  background_color text DEFAULT '#000000'::text,
  text_color text DEFAULT '#FFFFFF'::text,
  button_text text,
  button_url text,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean DEFAULT true,
  position text DEFAULT 'top'::text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Navigation Menus
CREATE TABLE public.navigation_menus (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Navigation Items
CREATE TABLE public.navigation_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  menu_id uuid REFERENCES public.navigation_menus(id),
  parent_id uuid REFERENCES public.navigation_items(id),
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  is_external boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store Modules (feature flags)
CREATE TABLE public.store_modules (
  id text PRIMARY KEY,
  enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Customers (CRM / POS)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  phone text,
  full_name text,
  first_name text,
  last_name text,
  user_id uuid REFERENCES auth.users(id),
  default_address jsonb,
  notes text,
  tags text[],
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_order_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  secondary_phone text,
  secondary_email text
);

-- Mark order as paid + reduce stock (must be after orders/order_items/products/product_variants exist)
CREATE OR REPLACE FUNCTION public.mark_order_paid(order_ref text, moolre_ref text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  updated_order orders;
BEGIN
  -- 1. Update the order to paid
  UPDATE orders
  SET 
    payment_status = 'paid',
    status = CASE 
        WHEN status = 'pending' THEN 'processing'::order_status
        WHEN status = 'awaiting_payment' THEN 'processing'::order_status
        ELSE status
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || 
               jsonb_build_object(
                   'moolre_reference', moolre_ref,
                   'payment_verified_at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
               )
  WHERE order_number = order_ref
  RETURNING * INTO updated_order;

  -- 2. Reduce stock (only if we found the order and haven't reduced yet)
  IF updated_order.id IS NOT NULL THEN
      IF (updated_order.metadata->>'stock_reduced') IS NULL THEN
          
          -- Reduce main product stock
          UPDATE products p
          SET quantity = GREATEST(0, p.quantity - oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = updated_order.id
            AND oi.product_id = p.id;

          -- Reduce variant stock (match by product_id + variant_name)
          UPDATE product_variants pv
          SET quantity = GREATEST(0, pv.quantity - oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = updated_order.id
            AND oi.product_id = pv.product_id
            AND oi.variant_name IS NOT NULL
            AND oi.variant_name = pv.name;
            
          -- Flag as reduced
          UPDATE orders 
          SET metadata = metadata || '{"stock_reduced": true}'::jsonb
          WHERE id = updated_order.id;
          
      END IF;
  ELSE
      -- Fallback search
      SELECT * INTO updated_order FROM orders WHERE order_number = order_ref;
  END IF;

  RETURN to_jsonb(updated_order);
END;
$$;

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

-- Addresses
CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

-- Categories
CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);
CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);

-- Products
CREATE INDEX idx_products_category ON public.products USING btree (category_id);
CREATE INDEX idx_products_featured ON public.products USING btree (featured);
CREATE INDEX idx_products_slug ON public.products USING btree (slug);
CREATE INDEX idx_products_status ON public.products USING btree (status);
CREATE INDEX idx_products_tags ON public.products USING gin (tags);

-- Blog Posts
CREATE INDEX idx_blog_slug ON public.blog_posts USING btree (slug);
CREATE INDEX idx_blog_status ON public.blog_posts USING btree (status);

-- Coupons
CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);

-- Orders
CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_pending_reminders ON public.orders USING btree (created_at)
  WHERE payment_status <> 'paid'::payment_status AND payment_reminder_sent = false;

-- Order Items
CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);

-- Notifications
CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id) WHERE read_at IS NULL;

-- Reviews
CREATE INDEX idx_reviews_product ON public.reviews USING btree (product_id);
CREATE INDEX idx_reviews_status ON public.reviews USING btree (status);

-- Support Tickets
CREATE INDEX idx_tickets_status ON public.support_tickets USING btree (status);
CREATE INDEX idx_tickets_user ON public.support_tickets USING btree (user_id);

-- Customers
CREATE INDEX idx_customers_email ON public.customers USING btree (email);
CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);
CREATE INDEX idx_customers_secondary_email ON public.customers USING btree (secondary_email);
CREATE INDEX idx_customers_secondary_phone ON public.customers USING btree (secondary_phone);

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON public.return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Review rating stats trigger
CREATE TRIGGER tr_update_product_rating AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_product_rating_stats();

-- Auth trigger: auto-create profile on signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff view any profile" ON public.profiles FOR SELECT USING (is_admin_or_staff());

-- Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage all addresses" ON public.addresses FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Store Settings
CREATE POLICY "Staff view settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Staff manage settings" ON public.store_settings FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Audit Logs
CREATE POLICY "Staff view audit logs" ON public.audit_logs FOR SELECT USING (is_admin_or_staff());
CREATE POLICY "Staff insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (is_admin_or_staff());

-- Categories
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Products
CREATE POLICY "Public view active products" ON public.products FOR SELECT USING (status = 'active'::product_status OR is_admin_or_staff());
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Product Images
CREATE POLICY "Public view images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Staff manage images" ON public.product_images FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Product Variants
CREATE POLICY "Public view variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Staff manage variants" ON public.product_variants FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Coupons
CREATE POLICY "Allow anon read access to coupons" ON public.coupons FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated read access to coupons" ON public.coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin insert on coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Allow admin update on coupons" ON public.coupons FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Allow admin delete on coupons" ON public.coupons FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

-- Orders
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR ((auth.uid() IS NULL) AND (user_id IS NULL)));
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable select for guest orders" ON public.orders FOR SELECT USING (user_id IS NULL);
CREATE POLICY "Staff manage all orders" ON public.orders FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Order Items
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Enable select for guest order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id IS NULL));
CREATE POLICY "Enable insert for order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)));
CREATE POLICY "Staff manage order items" ON public.order_items FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Order Status History
CREATE POLICY "Users view order history" ON public.order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Staff manage order history" ON public.order_status_history FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Cart Items
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wishlist Items
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Public view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved'::review_status);
CREATE POLICY "Users view own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff manage reviews" ON public.reviews FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Review Images
CREATE POLICY "Public view review images" ON public.review_images FOR SELECT USING (EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.status = 'approved'::review_status));
CREATE POLICY "Users manage review images" ON public.review_images FOR ALL USING (EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.user_id = auth.uid()));

-- Blog Posts
CREATE POLICY "Public view published posts" ON public.blog_posts FOR SELECT USING (status = 'published'::blog_status OR is_admin_or_staff());
CREATE POLICY "Staff manage blog" ON public.blog_posts FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Support Tickets
CREATE POLICY "Users manage own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage tickets" ON public.support_tickets FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Support Messages
CREATE POLICY "Users view ticket messages" ON public.support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Users create messages" ON public.support_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid()));
CREATE POLICY "Staff manage messages" ON public.support_messages FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Return Requests
CREATE POLICY "Users view own returns" ON public.return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create returns" ON public.return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage returns" ON public.return_requests FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Return Items
CREATE POLICY "Users view return items" ON public.return_items FOR SELECT USING (EXISTS (SELECT 1 FROM return_requests WHERE return_requests.id = return_items.return_request_id AND return_requests.user_id = auth.uid()));
CREATE POLICY "Staff manage return items" ON public.return_items FOR ALL USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Notifications
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pages
CREATE POLICY "Public can view pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Staff can manage pages" ON public.pages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

-- Site Settings
CREATE POLICY "Allow public read on site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write on site_settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- CMS Content
CREATE POLICY "Allow public read on cms_content" ON public.cms_content FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on cms_content" ON public.cms_content FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- Banners
CREATE POLICY "Allow public read on banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on banners" ON public.banners FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- Navigation Menus
CREATE POLICY "Allow public read on navigation_menus" ON public.navigation_menus FOR SELECT USING (true);
CREATE POLICY "Allow admin all on navigation_menus" ON public.navigation_menus FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- Navigation Items
CREATE POLICY "Allow public read on navigation_items" ON public.navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on navigation_items" ON public.navigation_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- Store Modules
CREATE POLICY "Allow public read access" ON public.store_modules FOR SELECT USING (true);
CREATE POLICY "Allow admin insert on store_modules" ON public.store_modules FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Allow authenticated update" ON public.store_modules FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Customers
CREATE POLICY "Staff can view all customers" ON public.customers FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Staff can manage customers" ON public.customers FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));
CREATE POLICY "Service role full access to customers" ON public.customers FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 9. STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true);

-- ============================================================================
-- 10. STORAGE POLICIES
-- ============================================================================

-- Products bucket
CREATE POLICY "Public read access for products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin upload access for products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND is_admin_or_staff() = true);
CREATE POLICY "Admin update access for products" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND is_admin_or_staff() = true);
CREATE POLICY "Admin delete access for products" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND is_admin_or_staff() = true);

-- Media bucket
CREATE POLICY "Public read access for media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin upload access for media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin_or_staff() = true);
CREATE POLICY "Admin delete access for media" ON storage.objects FOR DELETE USING (bucket_id = 'media' AND is_admin_or_staff() = true);

-- END: 20260209000000_complete_schema.sql

-- ------------------------------------------------------------
-- BEGIN: 20260218000000_allow_null_order_items_product_fks.sql
-- ------------------------------------------------------------
-- Allow null product_id and variant_id on order_items so products can be deleted.
-- Order rows keep product_name, sku, quantity, unit_price, etc. for history.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'variant_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.order_items ALTER COLUMN variant_id DROP NOT NULL;
  END IF;
END $$;

-- END: 20260218000000_allow_null_order_items_product_fks.sql

-- ------------------------------------------------------------
-- BEGIN: 20260219000000_contact_submissions.sql
-- ------------------------------------------------------------
-- Contact form submissions (referenced by app/(store)/contact/page.tsx).
-- Previously missing from schema; contact form insert was no-op.

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for admin listing by date
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (anon or authenticated)
CREATE POLICY "Allow insert for contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Only staff can read submissions
CREATE POLICY "Staff can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (public.is_admin_or_staff());

-- Optional: staff can update (e.g. mark as read) or delete
CREATE POLICY "Staff can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());
CREATE POLICY "Staff can delete contact submissions" ON public.contact_submissions
  FOR DELETE USING (public.is_admin_or_staff());

-- END: 20260219000000_contact_submissions.sql

-- ------------------------------------------------------------
-- BEGIN: 20260520000000_seed_fitaura_demo_products.sql
-- ------------------------------------------------------------
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

-- END: 20260520000000_seed_fitaura_demo_products.sql

-- ------------------------------------------------------------
-- BEGIN: 20260521000000_seed_fitaura_homepage_cms.sql
-- ------------------------------------------------------------
-- ============================================================================
-- FITAURA · HOMEPAGE CMS CONTENT SEED
--
-- Seeds the cms_content table with the homepage hero carousel slides and
-- the brand-story block. Image URLs start as relative `/hero-*.jpg` paths
-- so the page renders correctly even before the upload script runs.
--
-- After running `npm run upload-media`, these URLs are rewritten to public
-- Supabase Storage URLs (media bucket, /homepage prefix).
--
-- Safe to re-run — uses ON CONFLICT (section, block_key) DO UPDATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Homepage hero slides — section='homepage_hero'
-- ----------------------------------------------------------------------------
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
   3, true)
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

-- ----------------------------------------------------------------------------
-- 2. Brand story block — section='homepage', block_key='brand_story'
-- ----------------------------------------------------------------------------
INSERT INTO public.cms_content
  (section, block_key, title, subtitle, content, image_url,
   button_text, button_url, metadata, sort_order, is_active)
VALUES
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
       jsonb_build_object('icon','ri-pulse-line',    'title','Built To Move',       'body','Performance gymwear engineered for studio days and beyond.'),
       jsonb_build_object('icon','ri-sparkling-2-line','title','Fashion-Forward',    'body','Athleisure that wears just as well with denim and boots.'),
       jsonb_build_object('icon','ri-heart-3-line',  'title','Confidence In Comfort','body','Silhouettes designed to celebrate strength and ease.')
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

-- END: 20260521000000_seed_fitaura_homepage_cms.sql

-- ------------------------------------------------------------
-- BEGIN: 20260522000000_relocate_hero_media_paths.sql
-- ------------------------------------------------------------
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

-- END: 20260522000000_relocate_hero_media_paths.sql

-- ------------------------------------------------------------
-- BEGIN: 20260523000000_refresh_fitaura_brand_copy.sql
-- ------------------------------------------------------------
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

-- END: 20260523000000_refresh_fitaura_brand_copy.sql

-- ------------------------------------------------------------
-- BEGIN: 20260524000000_fitaura_cms_full_seed.sql
-- ------------------------------------------------------------
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

-- END: 20260524000000_fitaura_cms_full_seed.sql
