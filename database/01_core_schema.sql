-- ====================================================================
-- SKEMA DATABASE UTAMA (Blog & Statistik)
-- Eksekusi di Supabase SQL Editor jika membuat project baru
-- ====================================================================

-- 1. TABEL POSTS (Artikel Blog)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image text,
  tags text[],
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy Posts
-- Semua orang (anon/public) bisa membaca artikel yang published = true
CREATE POLICY "Public can view published posts" ON public.posts
  FOR SELECT USING (published = true);

-- Hanya Admin (authenticated) yang bisa CRUD artikel
CREATE POLICY "Admin can do all on posts" ON public.posts
  USING (auth.role() = 'authenticated');


-- ====================================================================

-- 2. TABEL PAGE_VIEWS (Statistik Pengunjung)
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  ip_hash text NOT NULL,
  device_type text,
  country text,
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy Page Views
-- Semua orang bisa melakukan insert data kunjungan
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Hanya Admin yang bisa membaca seluruh data kunjungan
CREATE POLICY "Admin can view all page views" ON public.page_views
  FOR SELECT USING (auth.role() = 'authenticated');
