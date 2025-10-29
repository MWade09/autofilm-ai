-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Drop tables if they exist
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP FUNCTION IF EXISTS public.get_clerk_uid() CASCADE;

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  idea TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'rendering', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  video_url TEXT,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_credits table
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Clerk user ID function in public schema
CREATE OR REPLACE FUNCTION public.get_clerk_uid()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_id TEXT;
BEGIN
  -- Extract user ID from JWT claims
  user_id := (current_setting('request.jwt.claims', true)::json)->>'sub';
  RETURN COALESCE(user_id, '');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_clerk_uid() TO authenticated;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for projects using Clerk user ID
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (public.get_clerk_uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (public.get_clerk_uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (public.get_clerk_uid() = user_id);

-- Create policies for user_credits using Clerk user ID
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (public.get_clerk_uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
  FOR UPDATE USING (public.get_clerk_uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON user_credits
  FOR INSERT WITH CHECK (public.get_clerk_uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_created_at_idx ON projects(created_at DESC);
