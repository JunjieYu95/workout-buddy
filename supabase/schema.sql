-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user1_id, user2_id)
);

-- Workout requests table
CREATE TABLE IF NOT EXISTS public.workout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id)
);

-- Stone progress table
CREATE TABLE IF NOT EXISTS public.stone_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id UUID NOT NULL UNIQUE REFERENCES public.partnerships(id) ON DELETE CASCADE,
  current_position INTEGER NOT NULL DEFAULT 0,
  target_position INTEGER NOT NULL DEFAULT 100,
  last_push_date DATE,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partnerships_user1 ON public.partnerships(user1_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_user2 ON public.partnerships(user2_id);
CREATE INDEX IF NOT EXISTS idx_workout_requests_user ON public.workout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_requests_partnership ON public.workout_requests(partnership_id);
CREATE INDEX IF NOT EXISTS idx_workout_requests_status ON public.workout_requests(status);
CREATE INDEX IF NOT EXISTS idx_stone_progress_partnership ON public.stone_progress(partnership_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stone_progress ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Partnerships policies
CREATE POLICY "Users can view their partnerships" ON public.partnerships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create partnerships" ON public.partnerships
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Workout requests policies
CREATE POLICY "Users can view requests in their partnerships" ON public.workout_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = workout_requests.partnership_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own workout requests" ON public.workout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update workout requests" ON public.workout_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = workout_requests.partnership_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Stone progress policies
CREATE POLICY "Users can view stone progress in their partnerships" ON public.stone_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = stone_progress.partnership_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update stone progress in their partnerships" ON public.stone_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = stone_progress.partnership_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Function to auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create stone progress when partnership is created
CREATE OR REPLACE FUNCTION public.handle_new_partnership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stone_progress (partnership_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stone progress
DROP TRIGGER IF EXISTS on_partnership_created ON public.partnerships;
CREATE TRIGGER on_partnership_created
  AFTER INSERT ON public.partnerships
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_partnership();