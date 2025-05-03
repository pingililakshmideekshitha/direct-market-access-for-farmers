-- Drop existing triggers, functions, views, and tables
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_delete();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP VIEW IF EXISTS public.crops_with_farmers;
DROP TABLE IF EXISTS public.crops;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.user_profiles;

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer','buyer')),
  state TEXT,
  district TEXT,
  village_city TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS and policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create storage bucket for crops images
INSERT INTO storage.buckets (id, name) VALUES ('crops', 'crops')
  ON CONFLICT (id) DO NOTHING;
-- Ensure the crops bucket is public for getPublicUrl
UPDATE storage.buckets SET public = TRUE WHERE id = 'crops';

-- Ensure avatars bucket exists and is public for profile photos
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars')
  ON CONFLICT (id) DO NOTHING;
UPDATE storage.buckets SET public = TRUE WHERE id = 'avatars';

-- Enable RLS on storage.objects and allow authenticated operations
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Remove existing policies if present
DROP POLICY IF EXISTS "Objects select" ON storage.objects;
DROP POLICY IF EXISTS "Objects insert" ON storage.objects;
DROP POLICY IF EXISTS "Objects update" ON storage.objects;
DROP POLICY IF EXISTS "Objects delete" ON storage.objects;
CREATE POLICY "Objects select" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Objects insert" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Objects update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Objects delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  quantity_type TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'removed'))
);

-- RLS and policies for crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Crops select" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Crops insert" ON public.crops FOR INSERT WITH CHECK (
  auth.uid() = farmer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'farmer'
  )
);
CREATE POLICY "Crops update" ON public.crops FOR UPDATE USING (
  auth.uid() = farmer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'farmer'
  )
);
CREATE POLICY "Crops delete" ON public.crops FOR DELETE USING (
  auth.uid() = farmer_id
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'farmer'
  )
);

-- Create view for crops with farmers
CREATE OR REPLACE VIEW public.crops_with_farmers AS
SELECT c.*, p.state AS state, p.district AS district,
       p.full_name AS farmer_name, p.phone AS farmer_phone, p.user_type AS farmer_type
FROM public.crops c
JOIN public.profiles p ON c.farmer_id = p.id;

-- Trigger function: new user signup -> create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, full_name, phone, state, district, village_city, avatar_url)
    VALUES (
      NEW.id,
      -- default to 'buyer' if missing or invalid
      COALESCE(NEW.raw_user_meta_data->>'user_type','buyer'),
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'state',
      NEW.raw_user_meta_data->>'district',
      NEW.raw_user_meta_data->>'village_city',
      NEW.raw_user_meta_data->>'avatar_url'
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
CREATE TRIGGER on_user_deleted BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();