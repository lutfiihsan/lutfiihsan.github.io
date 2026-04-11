-- ====================================================================
-- SKEMA USER MANAGEMENT / RBAC (Role-Based Access Control)
-- ====================================================================

-- 1. Buat tabel public.profiles untuk menyimpan role pengguna
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  role text DEFAULT 'editor', -- Role antara 'admin' atau 'editor'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Keamanan RLS di tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Semua user yang login dapat membaca tabel profiles (ini perlu agar sistem bisa mendeteksi role)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read all profiles' AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Authenticated users can read all profiles"
          ON public.profiles FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- 4. Policy: Hanya Admin yang dapat MENGUBAH tabel profiles (e.g. mengganti role orang lain)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update roles' AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Admins can update roles"
          ON public.profiles FOR UPDATE
          USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
    END IF;
END $$;

-- 5. Buat Function dan Trigger untuk OTOMATIS mengisi tabel profiles setiap ada user yang Mendaftar/Diundang
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'editor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- 6. MIGRASI DATA LAMA (Sangat Penting): 
-- Memasukkan user Anda yang sudah ada saat ini ke tabel profiles dan menjadikannya ADMIN.
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
