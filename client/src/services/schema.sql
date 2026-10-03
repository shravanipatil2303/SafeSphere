-- SafeSphere Database Schema & Row Level Security (RLS)

-- 1. Create Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'admin')) DEFAULT 'citizen',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Flood', 'Landslide', 'Road Blockage', 'Fallen Tree', 'Infrastructure Damage', 'Fire', 'Other')),
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  incident_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  media_url TEXT,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  ai_summary TEXT,
  ai_confidence NUMERIC(3, 2) DEFAULT 0.85,
  evidence_assessment TEXT,
  cluster_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Seen', 'In Progress', 'Resolved')) DEFAULT 'Pending',
  admin_seen BOOLEAN DEFAULT FALSE,
  recommended_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Incident Updates table (Admin comments & status updates)
CREATE TABLE IF NOT EXISTS public.incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Seen', 'In Progress', 'Resolved')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS POLICIES FOR INCIDENTS
CREATE POLICY "Citizens can insert own incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Citizens can view own incidents, Admins view all"
  ON public.incidents FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can update incidents"
  ON public.incidents FOR UPDATE
  USING (public.is_admin());

-- RLS POLICIES FOR INCIDENT UPDATES
CREATE POLICY "Citizens view updates for their incidents, Admins view all"
  ON public.incident_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents
      WHERE incidents.id = incident_updates.incident_id
      AND (incidents.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Only admins can insert incident updates"
  ON public.incident_updates FOR INSERT
  WITH CHECK (public.is_admin());

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
